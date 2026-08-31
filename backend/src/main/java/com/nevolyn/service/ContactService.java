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
import java.time.Year;
import java.util.Random;
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
    private final Random random = new Random();

    @Transactional
    public ContactResponse processInquiry(ContactRequest request) {
        // Honeypot Bot Trap Check
        if (request.getHoneypot() != null && !request.getHoneypot().trim().isEmpty()) {
            log.warn("Honeypot bot trap triggered for contact form submission from email: {}", request.getEmail());
            return ContactResponse.builder()
                    .inquiryId("INQ-DISCARDED")
                    .status("DISCARDED")
                    .requiresVerification(false)
                    .isVerified(false)
                    .build();
        }

        String inquiryId = String.format("INQ-%d-%06d", Year.now().getValue(), System.currentTimeMillis() % 1000000L);
        String verificationToken = UUID.randomUUID().toString();

        log.debug("Generating unique inquiry ID '{}' and verification token for email '{}'", inquiryId, request.getEmail());

        ContactInquiry entity = ContactInquiry.builder()
                .inquiryId(inquiryId)
                .name(request.getName())
                .email(request.getEmail())
                .subject(request.getSubject())
                .message(request.getMessage())
                .verificationToken(verificationToken)
                .isVerified(true)
                .verifiedAt(LocalDateTime.now())
                .build();

        ContactInquiry savedEntity = repository.save(entity);
        log.debug("Persisted ContactInquiry entity with ID: {}", savedEntity.getId());

        // Dispatch Admin Alert Email directly to NEVOLYN team
        emailService.sendAdminNotificationEmail(
                "Contact Inquiry",
                inquiryId,
                request.getName(),
                request.getEmail(),
                null,
                null,
                request.getSubject(),
                null,
                request.getMessage(),
                null
        );

        // Step 1: Dispatch Submission Confirmation Email to visitor
        emailService.sendSenderVerificationEmail(
                request.getEmail(),
                request.getName(),
                inquiryId,
                "contact"
        );

        return ContactResponse.builder()
                .inquiryId(inquiryId)
                .status("SUBMITTED")
                .requiresVerification(false)
                .isVerified(true)
                .build();
    }

    @Transactional
    public ContactResponse verifyInquiry(String token) {
        log.info("Verifying contact inquiry with token: {}", token);
        ContactInquiry inquiry = repository.findByVerificationToken(token)
                .orElseThrow(() -> new ResourceNotFoundException("Invalid or expired verification token: " + token));

        if (!inquiry.getIsVerified()) {
            inquiry.setIsVerified(true);
            inquiry.setVerifiedAt(LocalDateTime.now());
            repository.save(inquiry);
            log.info("Contact inquiry '{}' verified successfully.", inquiry.getInquiryId());

            // Step 2: Send Admin Notification
            emailService.sendAdminNotificationEmail(
                    "Contact Inquiry",
                    inquiry.getInquiryId(),
                    inquiry.getName(),
                    inquiry.getEmail(),
                    null,
                    null,
                    inquiry.getSubject(),
                    null,
                    inquiry.getMessage(),
                    null
            );

            // Step 3: Send User Receipt Acknowledgement
            emailService.sendUserAcknowledgementEmail(
                    inquiry.getEmail(),
                    inquiry.getName(),
                    inquiry.getInquiryId(),
                    "Contact Inquiry"
            );
        }

        return ContactResponse.builder()
                .inquiryId(inquiry.getInquiryId())
                .status("VERIFIED")
                .requiresVerification(false)
                .isVerified(true)
                .build();
    }
}
