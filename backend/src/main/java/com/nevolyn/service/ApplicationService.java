package com.nevolyn.service;

import com.nevolyn.dto.ApplicationResponse;
import com.nevolyn.exception.ResourceNotFoundException;
import com.nevolyn.model.JobApplication;
import com.nevolyn.repository.JobApplicationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.UUID;

/**
 * Business logic service managing job applications, document storage, and
 * verification pipeline.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ApplicationService {

    private final JobApplicationRepository repository;
    private final FileStorageService fileStorageService;
    private final EmailService emailService;
    private final ReferenceCodeGenerator referenceCodeGenerator;
    private final PdfGenerationService pdfGenerationService;

    @Transactional
    public ApplicationResponse processApplication(
            String name,
            String email,
            String phone,
            String address,
            String nid,
            String reason,
            String linkedin,
            String github,
            String website,
            String honeypot,
            MultipartFile resume) {
        // Honeypot Bot Trap Check
        if (honeypot != null && !honeypot.trim().isEmpty()) {
            log.warn("Honeypot bot trap triggered for job application submission from email: {}", maskEmail(email));
            return ApplicationResponse.builder()
                    .applicationId("APP-DISCARDED")
                    .fileName(resume != null ? resume.getOriginalFilename() : "file.pdf")
                    .status("DISCARDED")
                    .requiresVerification(false)
                    .isVerified(false)
                    .build();
        }

        String applicationId = referenceCodeGenerator.generate(SubmissionType.JOB_APPLICATION);
        String verificationToken = UUID.randomUUID().toString();

        log.debug("Processing job application for '{}', generated ID: {}", name, applicationId);

        byte[] resumeBytes = null;
        if (resume != null) {
            try {
                resumeBytes = resume.getBytes();
            } catch (Exception e) {
                log.warn("Could not read uploaded resume bytes: {}", e.getMessage());
            }
        }

        String storedPath = fileStorageService.storeFile(resume,
                applicationId + "_" + name.replaceAll("\\s+", "_").toLowerCase());
        log.debug("Resume stored on disk at path: {}", storedPath);

        JobApplication entity = JobApplication.builder()
                .applicationId(applicationId)
                .name(name)
                .email(email)
                .phone(phone)
                .address(address)
                .nid(nid)
                .reason(reason)
                .linkedin(linkedin)
                .github(github)
                .website(website)
                .resumePath(storedPath)
                .originalFileName(resume != null ? resume.getOriginalFilename() : "resume.pdf")
                .fileSizeBytes(resume != null ? resume.getSize() : null)
                .fileContentType(resume != null ? resume.getContentType() : null)
                .isSelected(false)
                .selectionStatus("PENDING")
                .verificationToken(verificationToken)
                .isVerified(true)
                .verifiedAt(LocalDateTime.now(ZoneOffset.UTC))
                .build();

        // Generate official candidate application PDF (Page 1 statement &
        // credentials, merged with candidate CV)
        try {
            byte[] dossierPdfBytes = pdfGenerationService.generateCandidateDossierPdf(entity, resumeBytes);
            if (dossierPdfBytes != null && dossierPdfBytes.length > 0) {
                String dossierPath = fileStorageService.storeBytes(
                        dossierPdfBytes,
                        "NEVOLYN_" + applicationId + ".pdf");
                entity.setDossierPath(dossierPath);
                log.info("Candidate application document successfully generated and stored at '{}'", dossierPath);
            }
        } catch (Exception ex) {
            log.error("Could not generate merged dossier PDF for '{}': {}", applicationId, ex.getMessage(), ex);
        }

        JobApplication savedEntity = repository.save(entity);
        log.debug("Persisted JobApplication entity to database with PK ID: {}", savedEntity.getId());

        SubmissionDetails details = SubmissionDetails.from(savedEntity);

        // Dispatch Admin Alert Email directly to NEVOLYN team with candidate CV
        // attached
        emailService.sendAdminNotificationEmail(details);

        // Step 1: Dispatch Submission Confirmation Email to candidate
        emailService.sendSenderConfirmationEmail(details);

        return ApplicationResponse.builder()
                .applicationId(applicationId)
                .fileName(resume != null ? resume.getOriginalFilename() : "resume.pdf")
                .pdfUrl("/api/v1/applications/" + applicationId + "/pdf")
                .status("SUBMITTED")
                .requiresVerification(false)
                .isVerified(true)
                .build();
    }

    @Transactional
    public ApplicationResponse verifyApplication(String token) {
        log.info("Verifying job application with token");
        JobApplication app = repository.findByVerificationToken(token)
                .orElseThrow(() -> new ResourceNotFoundException("Invalid or expired verification token: " + token));

        if (!app.getIsVerified()) {
            app.setIsVerified(true);
            app.setVerifiedAt(LocalDateTime.now(ZoneOffset.UTC));
            repository.save(app);
            log.info("Job application '{}' verified successfully.", app.getApplicationId());

            SubmissionDetails details = SubmissionDetails.from(app);

            // Step 2: Send Admin Notification with CV attachment
            emailService.sendAdminNotificationEmail(details);

            // Step 3: Send User Receipt Acknowledgement
            emailService.sendUserAcknowledgementEmail(details);
        }

        return ApplicationResponse.builder()
                .applicationId(app.getApplicationId())
                .fileName(app.getOriginalFileName())
                .pdfUrl("/api/v1/applications/" + app.getApplicationId() + "/pdf")
                .status("VERIFIED")
                .requiresVerification(false)
                .isVerified(true)
                .build();
    }

    @Transactional(readOnly = true)
    public byte[] getApplicationPdfBytes(String applicationId) {
        JobApplication app = repository.findByApplicationId(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found for ID: " + applicationId));

        String pathToRead = app.getDossierPath() != null ? app.getDossierPath() : app.getResumePath();
        if (pathToRead != null) {
            try {
                java.io.File file = new java.io.File(pathToRead);
                if (file.isFile()) {
                    return java.nio.file.Files.readAllBytes(file.toPath());
                }
            } catch (Exception ex) {
                log.error("Could not read application dossier from disk: {}", ex.getMessage());
            }
        }
        throw new ResourceNotFoundException("Application dossier document not available for ID: " + applicationId);
    }

    private static String maskEmail(String email) {
        if (email == null || email.isBlank()) {
            return "unknown";
        }
        int at = email.indexOf('@');
        if (at <= 1) {
            return "***" + (at >= 0 ? email.substring(at) : "");
        }
        return email.charAt(0) + "***" + email.substring(at);
    }
}
