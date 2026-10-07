package com.nevolyn.service;

import com.nevolyn.dto.ContactRequest;
import com.nevolyn.dto.ContactResponse;
import com.nevolyn.exception.ResourceNotFoundException;
import com.nevolyn.model.ContactInquiry;
import com.nevolyn.repository.ContactInquiryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.UUID;

/**
 * Business logic service managing visitor contact inquiry submissions and verification pipeline.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ContactService {

    private final ContactInquiryRepository repository;
    private final EmailService emailService;
    private final ReferenceCodeGenerator referenceCodeGenerator;

    @Transactional
    public ContactResponse processInquiry(ContactRequest request) {
        // Honeypot Bot Trap Check
        if (request.getHoneypot() != null && !request.getHoneypot().trim().isEmpty()) {
            log.warn("Honeypot bot trap triggered for contact form submission from email: {}", maskEmail(request.getEmail()));
            return ContactResponse.builder()
                    .inquiryId("INQ-DISCARDED")
                    .status("DISCARDED")
                    .requiresVerification(false)
                    .isVerified(false)
                    .build();
        }

        String inquiryId = referenceCodeGenerator.generate(SubmissionType.CONTACT_INQUIRY);
        String verificationToken = UUID.randomUUID().toString();

        log.debug("Generating unique inquiry ID '{}' for email '{}'", inquiryId, maskEmail(request.getEmail()));

        ContactInquiry entity = ContactInquiry.builder()
                .inquiryId(inquiryId)
                .name(request.getName())
                .email(request.getEmail())
                .subject(request.getSubject())
                .message(request.getMessage())
                .verificationToken(verificationToken)
                .isVerified(true)
                .verifiedAt(LocalDateTime.now(ZoneOffset.UTC))
                .build();

        ContactInquiry savedEntity = repository.save(entity);
        log.debug("Persisted ContactInquiry entity with ID: {}", savedEntity.getId());

        SubmissionDetails details = SubmissionDetails.from(savedEntity);

        // Dispatch Admin Alert Email directly to NEVOLYN team
        emailService.sendAdminNotificationEmail(details);

        // Step 1: Dispatch Submission Confirmation Email to visitor
        emailService.sendSenderConfirmationEmail(details);

        return ContactResponse.builder()
                .inquiryId(inquiryId)
                .status("SUBMITTED")
                .requiresVerification(false)
                .isVerified(true)
                .build();
    }

    @Transactional
    public ContactResponse verifyInquiry(String token) {
        log.info("Verifying contact inquiry with token");
        ContactInquiry inquiry = repository.findByVerificationToken(token)
                .orElseThrow(() -> new ResourceNotFoundException("Invalid or expired verification token: " + token));

        if (!inquiry.getIsVerified()) {
            inquiry.setIsVerified(true);
            inquiry.setVerifiedAt(LocalDateTime.now(ZoneOffset.UTC));
            repository.save(inquiry);
            log.info("Contact inquiry '{}' verified successfully.", inquiry.getInquiryId());

            SubmissionDetails details = SubmissionDetails.from(inquiry);

            // Step 2: Send Admin Notification
            emailService.sendAdminNotificationEmail(details);

            // Step 3: Send User Receipt Acknowledgement
            emailService.sendUserAcknowledgementEmail(details);
        }

        return ContactResponse.builder()
                .inquiryId(inquiry.getInquiryId())
                .status("VERIFIED")
                .requiresVerification(false)
                .isVerified(true)
                .build();
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
