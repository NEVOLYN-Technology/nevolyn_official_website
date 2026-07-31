package com.saturn.rnd.service;

import com.saturn.rnd.dto.ApplicationResponse;
import com.saturn.rnd.exception.ResourceNotFoundException;
import com.saturn.rnd.model.JobApplication;
import com.saturn.rnd.repository.JobApplicationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.time.Year;
import java.util.Random;
import java.util.UUID;

/**
 * Business logic service managing job applications, document storage, and verification pipeline.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ApplicationService {

    private final JobApplicationRepository repository;
    private final FileStorageService fileStorageService;
    private final EmailService emailService;
    private final Random random = new Random();

    @Transactional
    public ApplicationResponse processApplication(
            String name,
            String email,
            String phone,
            String address,
            String reason,
            String linkedin,
            String github,
            String website,
            String honeypot,
            MultipartFile resume
    ) {
        // Honeypot Bot Trap Check
        if (honeypot != null && !honeypot.trim().isEmpty()) {
            log.warn("Honeypot bot trap triggered for job application submission from email: {}", email);
            return ApplicationResponse.builder()
                    .applicationId("APP-DISCARDED")
                    .fileName(resume != null ? resume.getOriginalFilename() : "file.pdf")
                    .status("DISCARDED")
                    .requiresVerification(false)
                    .isVerified(false)
                    .build();
        }

        String applicationId = String.format("APP-%d-%06d", Year.now().getValue(), System.currentTimeMillis() % 1000000L);
        String verificationToken = UUID.randomUUID().toString();

        log.debug("Processing job application for '{}', generated ID: {}", name, applicationId);

        String storedPath = fileStorageService.storeFile(resume, applicationId + "_" + name.replaceAll("\\s+", "_").toLowerCase());
        log.debug("Resume stored on disk at path: {}", storedPath);

        JobApplication entity = JobApplication.builder()
                .applicationId(applicationId)
                .name(name)
                .email(email)
                .phone(phone)
                .address(address)
                .reason(reason)
                .linkedin(linkedin)
                .github(github)
                .website(website)
                .resumePath(storedPath)
                .originalFileName(resume != null ? resume.getOriginalFilename() : "resume.pdf")
                .verificationToken(verificationToken)
                .isVerified(true)
                .verifiedAt(LocalDateTime.now())
                .build();

        JobApplication savedEntity = repository.save(entity);
        log.debug("Persisted JobApplication entity to database with PK ID: {}", savedEntity.getId());

        // Join pre-formatted social links for the admin notification email
        StringBuilder links = new StringBuilder();
        if (linkedin != null && !linkedin.isBlank()) links.append("LinkedIn: ").append(linkedin).append("\n");
        if (github != null && !github.isBlank()) links.append("GitHub: ").append(github).append("\n");
        if (website != null && !website.isBlank()) links.append("Portfolio: ").append(website);

        // Dispatch Admin Alert Email directly to Saturn R&D team with candidate CV attached
        emailService.sendAdminNotificationEmail(
                "Job Application",
                applicationId,
                name,
                email,
                phone,
                address,
                "Job Application Submission",
                links.toString(),
                reason,
                storedPath
        );

        // Step 1: Dispatch Submission Confirmation Email to candidate
        emailService.sendSenderVerificationEmail(
                email,
                name,
                applicationId,
                "application"
        );

        return ApplicationResponse.builder()
                .applicationId(applicationId)
                .fileName(resume != null ? resume.getOriginalFilename() : "resume.pdf")
                .status("SUBMITTED")
                .requiresVerification(false)
                .isVerified(true)
                .build();
    }

    @Transactional
    public ApplicationResponse verifyApplication(String token) {
        log.info("Verifying job application with token: {}", token);
        JobApplication app = repository.findByVerificationToken(token)
                .orElseThrow(() -> new ResourceNotFoundException("Invalid or expired verification token: " + token));

        if (!app.getIsVerified()) {
            app.setIsVerified(true);
            app.setVerifiedAt(LocalDateTime.now());
            repository.save(app);
            log.info("Job application '{}' verified successfully.", app.getApplicationId());

            StringBuilder links = new StringBuilder();
            if (app.getLinkedin() != null && !app.getLinkedin().isBlank()) links.append("LinkedIn: ").append(app.getLinkedin()).append("\n");
            if (app.getGithub() != null && !app.getGithub().isBlank()) links.append("GitHub: ").append(app.getGithub()).append("\n");
            if (app.getWebsite() != null && !app.getWebsite().isBlank()) links.append("Portfolio: ").append(app.getWebsite());

            // Step 2: Send Admin Notification with CV attachment
            emailService.sendAdminNotificationEmail(
                    "Job Application",
                    app.getApplicationId(),
                    app.getName(),
                    app.getEmail(),
                    app.getPhone(),
                    app.getAddress(),
                    "Application for R&D Team",
                    links.toString(),
                    app.getReason(),
                    app.getResumePath()
            );

            // Step 3: Send User Receipt Acknowledgement
            emailService.sendUserAcknowledgementEmail(
                    app.getEmail(),
                    app.getName(),
                    app.getApplicationId(),
                    "Job Application"
            );
        }

        return ApplicationResponse.builder()
                .applicationId(app.getApplicationId())
                .fileName(app.getOriginalFileName())
                .status("VERIFIED")
                .requiresVerification(false)
                .isVerified(true)
                .build();
    }
}
