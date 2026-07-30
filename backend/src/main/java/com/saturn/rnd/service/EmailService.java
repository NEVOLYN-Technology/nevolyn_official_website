package com.saturn.rnd.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.io.File;
import java.nio.charset.StandardCharsets;

/**
 * Non-blocking asynchronous email delivery service for Saturn R&D platform.
 * Supports sender verification, admin notification (with attachment), and user acknowledgement.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    @Value("${app.email.from:noreply@saturn-rnd.com}")
    private String fromEmail;

    @Value("${app.email.admin:admin@saturn-rnd.com}")
    private String adminEmail;

    @Value("${app.email.frontend-url:http://localhost:3000}")
    private String frontendUrl;

    @Value("${spring.mail.password:}")
    private String mailPassword;

    /**
     * Step 1: Sends Sender Email Verification email containing secure link.
     */
    @Async
    public void sendSenderVerificationEmail(String recipientEmail, String name, String token, String type) {
        String verifyUrl = frontendUrl + "/verify?token=" + token + "&type=" + type;
        String formTypeLabel = "contact".equalsIgnoreCase(type) ? "Contact Inquiry Verification" : "Job Application Verification";

        log.info("Preparing Sender Verification Email for '{}' (Type: {}, Token: {})", recipientEmail, type, token);

        Context context = new Context();
        context.setVariable("name", name);
        context.setVariable("formType", formTypeLabel);
        context.setVariable("verifyUrl", verifyUrl);

        String htmlContent = templateEngine.process("email/sender-verification", context);

        if (mailPassword == null || mailPassword.isBlank()) {
            log.warn("=== DEV MOCK EMAIL DISPATCH ===");
            log.warn("To: {}", recipientEmail);
            log.warn("Subject: Verify Your Email Address - Saturn R&D");
            log.warn("Verify URL: {}", verifyUrl);
            log.warn("================================");
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, StandardCharsets.UTF_8.name());
            helper.setFrom(fromEmail);
            helper.setTo(recipientEmail);
            helper.setSubject("Verify Your Email Address - Saturn R&D");
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("Successfully dispatched Sender Verification email to {}", recipientEmail);
        } catch (Exception e) {
            log.error("Failed to send Sender Verification email to {}", recipientEmail, e);
        }
    }

    /**
     * Step 2: Sends Admin Notification email upon sender verification.
     */
    @Async
    public void sendAdminNotificationEmail(
            String formType,
            String trackingId,
            String name,
            String userEmail,
            String phone,
            String address,
            String subject,
            String links,
            String messageContent,
            String attachmentFilePath
    ) {
        log.info("Preparing Admin Notification Email for trackingId='{}', type='{}'", trackingId, formType);

        Context context = new Context();
        context.setVariable("formType", formType.toUpperCase());
        context.setVariable("trackingId", trackingId);
        context.setVariable("name", name);
        context.setVariable("userEmail", userEmail);
        context.setVariable("phone", phone);
        context.setVariable("address", address);
        context.setVariable("subject", subject);
        context.setVariable("links", links);
        context.setVariable("messageContent", messageContent);
        context.setVariable("hasAttachment", attachmentFilePath != null && new File(attachmentFilePath).exists());

        String htmlContent = templateEngine.process("email/admin-notification", context);

        if (mailPassword == null || mailPassword.isBlank()) {
            log.warn("=== DEV MOCK ADMIN ALERT DISPATCH ===");
            log.warn("To Admin: {}", adminEmail);
            log.warn("Tracking ID: {}", trackingId);
            log.warn("Attachment File: {}", attachmentFilePath);
            log.warn("=====================================");
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, StandardCharsets.UTF_8.name());
            helper.setFrom(fromEmail);
            helper.setTo(adminEmail);
            helper.setReplyTo(userEmail);
            helper.setSubject("[VERIFIED ALERT] " + formType + ": " + trackingId + " - " + name);
            helper.setText(htmlContent, true);

            if (attachmentFilePath != null) {
                File attachmentFile = new File(attachmentFilePath);
                if (attachmentFile.exists()) {
                    FileSystemResource fileResource = new FileSystemResource(attachmentFile);
                    helper.addAttachment(attachmentFile.getName(), fileResource);
                }
            }

            mailSender.send(message);
            log.info("Successfully dispatched Admin Notification email to {}", adminEmail);
        } catch (Exception e) {
            log.error("Failed to send Admin Notification email for {}", trackingId, e);
        }
    }

    /**
     * Step 3: Sends User Submission Receipt Acknowledgement email.
     */
    @Async
    public void sendUserAcknowledgementEmail(String recipientEmail, String name, String trackingId, String formType) {
        log.info("Preparing User Acknowledgement Email for '{}' (Tracking ID: {})", recipientEmail, trackingId);

        Context context = new Context();
        context.setVariable("name", name);
        context.setVariable("trackingId", trackingId);
        context.setVariable("formType", formType.toLowerCase());

        String htmlContent = templateEngine.process("email/user-acknowledgement", context);

        if (mailPassword == null || mailPassword.isBlank()) {
            log.warn("=== DEV MOCK ACKNOWLEDGEMENT DISPATCH ===");
            log.warn("To: {}", recipientEmail);
            log.warn("Tracking ID: {}", trackingId);
            log.warn("=========================================");
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, StandardCharsets.UTF_8.name());
            helper.setFrom(fromEmail);
            helper.setTo(recipientEmail);
            helper.setSubject("Submission Receipt Acknowledgement [" + trackingId + "] - Saturn R&D");
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("Successfully dispatched User Acknowledgement email to {}", recipientEmail);
        } catch (Exception e) {
            log.error("Failed to send User Acknowledgement email to {}", recipientEmail, e);
        }
    }
}
