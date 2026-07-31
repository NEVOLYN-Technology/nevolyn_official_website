package com.saturn.rnd.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
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
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.time.Duration;
import java.util.Base64;

/**
 * Non-blocking asynchronous email delivery service for the Saturn R&D platform.
 *
 * <h2>Three-step verification pipeline</h2>
 * <ol>
 * <li>{@link #sendSenderVerificationEmail} — double opt-in link proving the
 * submitter owns the address they typed.</li>
 * <li>{@link #sendAdminNotificationEmail} — full submission dossier to the R&D
 * inbox, with the candidate CV attached for job applications.</li>
 * <li>{@link #sendUserAcknowledgementEmail} — receipt with tracking ID.</li>
 * </ol>
 *
 * <h2>Dual delivery engine</h2>
 * Cloud PaaS providers (Render, Heroku, most AWS accounts) block outbound SMTP
 * on ports 25/587 to curb spam, so a plain JavaMail transport silently hangs
 * until socket timeout in production. This service therefore prefers an HTTPS
 * transport that no provider blocks:
 * <ol>
 * <li><b>Primary — Brevo REST API v3 over HTTPS (port 443).</b> Selected
 * automatically when the configured credential is a Brevo API key (prefix
 * {@code xsmtpsib-}). Immune to SMTP port blocking; typical latency
 * &lt;100ms.</li>
 * <li><b>Fallback — JavaMail SMTP.</b> Used when the credential is not a Brevo
 * key, or when the REST call fails. Pair with SMTPS on port 465 in production
 * (see {@code application-prod.yml}); port 587 STARTTLS will time out on
 * Render.</li>
 * </ol>
 * With no credential configured at all, every send is logged instead of
 * transmitted so local development never needs a mail account.
 *
 * <p>
 * All three public methods are {@code @Async}, so the HTTP request that
 * triggered them returns without waiting for mail delivery. Because the caller
 * is already gone by the time these run, failures cannot be surfaced to the
 * user — they are logged with a full stack trace instead.
 *
 * @author Saturn R&D Engineering
 * @version 0.2.0
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    /** Brevo API keys carry this prefix; presence of it selects the REST engine. */
    private static final String BREVO_KEY_PREFIX = "xsmtpsib-";

    /** Brevo transactional email endpoint (HTTPS / port 443). */
    private static final String BREVO_API_ENDPOINT = "https://api.brevo.com/v3/smtp/email";

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    /** Reused across sends; the JDK client is thread-safe and pools connections. */
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Envelope sender. Must be a Brevo-verified sender when using the REST engine.
     */
    @Value("${app.email.from:noreply@saturn-rnd.com}")
    private String fromEmail;

    /** Destination for step-2 admin dossiers. */
    @Value("${app.email.admin:admin@saturn-rnd.com}")
    private String adminEmail;

    /** Public site origin used to build the step-1 verification link. */
    @Value("${app.email.frontend-url:http://localhost:3000}")
    private String frontendUrl;

    /** Public REST API backend URL used to handle 1-click acknowledge requests. */
    @Value("${app.email.backend-url:http://localhost:8080}")
    private String backendUrl;

    /** Friendly From display name, e.g. {@code Saturn Textiles R&D <noreply@…>}. */
    @Value("${app.email.sender-name:Saturn Textiles R&D}")
    private String senderName;

    /**
     * Doubles as the Brevo API key and the SMTP password. A blank value puts the
     * service into log-only development mode.
     */
    @Value("${spring.mail.password:}")
    private String mailCredential;

    // ------------------------------------------------------------------
    // Step 1 — sender verification
    // ------------------------------------------------------------------

    /**
     * Sends the double opt-in email carrying the secure verification link.
     *
     * @param recipientEmail address the visitor entered, and the one being proven
     * @param name           display name used to personalise the greeting
     * @param token          opaque single-use verification token
     * @param type           {@code contact} or {@code application}; selects copy
     *                       and is echoed back on the verify callback
     */
    @Async
    public void sendSenderVerificationEmail(String recipientEmail, String name, String token, String type) {
        String verifyUrl = resolveFrontendUrl() + "/verify?token=" + token + "&type=" + type;
        String formTypeLabel = "contact".equalsIgnoreCase(type)
                ? "Contact Inquiry Verification"
                : "Job Application Verification";

        log.info("Preparing Sender Verification Email for '{}' (Type: {})", recipientEmail, type);

        Context context = new Context();
        context.setVariable("name", name);
        context.setVariable("email", recipientEmail);
        context.setVariable("userEmail", recipientEmail);
        context.setVariable("formType", formTypeLabel);
        context.setVariable("verifyUrl", verifyUrl);

        String htmlContent = templateEngine.process("email/sender-verification", context);

        dispatch(recipientEmail, "Verify Your Email Address - Saturn R&D", htmlContent, null, null);
    }

    // ------------------------------------------------------------------
    // Step 2 — admin notification
    // ------------------------------------------------------------------

    /**
     * Sends the verified-submission dossier to the R&D admin inbox.
     *
     * <p>
     * Reply-To is set to the submitter so staff can answer straight from their
     * mail client without copying the address out of the body.
     *
     * @param formType           human label, e.g. {@code Contact Inquiry}
     * @param trackingId         public reference code, e.g. {@code INQ-2026-0042}
     * @param name               submitter display name
     * @param userEmail          submitter address; becomes the Reply-To header
     * @param phone              optional phone number, may be {@code null}
     * @param address            optional postal address, may be {@code null}
     * @param subject            optional subject line supplied by the submitter
     * @param links              optional pre-joined social/portfolio links
     * @param messageContent     free-text body of the submission
     * @param attachmentFilePath absolute path to the stored CV, or {@code null}
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
            String attachmentFilePath) {
        log.info("Preparing Admin Notification Email for trackingId='{}', type='{}'", trackingId, formType);

        File attachment = resolveAttachment(attachmentFilePath);

        String acknowledgeUrl = resolveBackendUrl() + "/api/v1/acknowledge?trackingId=" + trackingId;

        Context context = new Context();
        context.setVariable("formType", formType.toUpperCase());
        context.setVariable("trackingId", trackingId);
        context.setVariable("name", name);
        context.setVariable("userEmail", userEmail);
        context.setVariable("email", userEmail);
        context.setVariable("phone", phone);
        context.setVariable("address", address);
        context.setVariable("subject", subject);
        context.setVariable("links", links);
        context.setVariable("messageContent", messageContent);
        context.setVariable("hasAttachment", attachment != null);
        context.setVariable("acknowledgeUrl", acknowledgeUrl);

        String htmlContent = templateEngine.process("email/admin-notification", context);
        String subjectTag = formType.toLowerCase().contains("application") ? "[NEW JOB APPLICATION]"
                : "[NEW CONTACT INQUIRY]";
        String mailSubject = subjectTag + " " + trackingId + " - " + name;

        dispatch(adminEmail, mailSubject, htmlContent, userEmail, attachment);
    }

    // ------------------------------------------------------------------
    // Step 3 — user acknowledgement
    // ------------------------------------------------------------------

    /**
     * Sends the closing receipt confirming the submission is now with the team.
     *
     * @param recipientEmail verified submitter address
     * @param name           display name used to personalise the greeting
     * @param trackingId     public reference code the submitter can quote later
     * @param formType       human label, e.g. {@code Job Application}
     */
    @Async
    public void sendUserAcknowledgementEmail(String recipientEmail, String name, String trackingId, String formType) {
        log.info("Preparing User Acknowledgement Email for '{}' (Tracking ID: {})", recipientEmail, trackingId);

        Context context = new Context();
        context.setVariable("name", name);
        context.setVariable("email", recipientEmail);
        context.setVariable("userEmail", recipientEmail);
        context.setVariable("trackingId", trackingId);
        context.setVariable("formType", formType.toLowerCase());

        String htmlContent = templateEngine.process("email/user-acknowledgement", context);
        String subjectPrefix = formType.toLowerCase().contains("application") ? "Job Application Receipt"
                : "Contact Inquiry Receipt";
        String subject = subjectPrefix + " [" + trackingId + "] - Saturn R&D";

        dispatch(recipientEmail, subject, htmlContent, null, null);
    }

    // ------------------------------------------------------------------
    // Delivery engines
    // ------------------------------------------------------------------

    /**
     * Routes one message through the best available transport.
     *
     * <p>
     * Order of preference: Brevo REST (HTTPS) → JavaMail SMTP → log-only
     * simulation. This method never throws; it is called from {@code @Async}
     * paths where no caller remains to handle an exception.
     *
     * @param to         recipient address
     * @param subject    message subject
     * @param html       fully rendered HTML body
     * @param replyTo    optional Reply-To address, may be {@code null}
     * @param attachment optional file to attach, may be {@code null}
     */
    private boolean isBrevoApiKey(String key) {
        if (key == null || key.isBlank()) {
            return false;
        }
        String k = key.trim().toLowerCase();
        return k.startsWith("xsmtpsib-") || k.startsWith("xkeysib-") || (k.length() > 20 && k.contains("-"));
    }

    private void dispatch(String to, String subject, String html, String replyTo, File attachment) {
        if (mailCredential == null || mailCredential.isBlank()) {
            log.warn("=== DEV MOCK EMAIL DISPATCH (no mail credential configured) ===");
            log.warn("To: {} | Subject: {}", to, subject);
            if (attachment != null) {
                log.warn("Attachment: {}", attachment.getAbsolutePath());
            }
            log.warn("===============================================================");
            return;
        }

        if (isBrevoApiKey(mailCredential) && sendViaBrevoApi(to, subject, html, replyTo, attachment)) {
            return;
        }

        sendViaSmtp(to, subject, html, replyTo, attachment);
    }

    /**
     * Delivers via the Brevo REST API over HTTPS, bypassing SMTP port blocks.
     *
     * @return {@code true} when Brevo accepted the message; {@code false} to tell
     *         {@link #dispatch} to fall through to SMTP
     */
    private boolean sendViaBrevoApi(String to, String subject, String html, String replyTo, File attachment) {
        try {
            ObjectNode payload = objectMapper.createObjectNode();

            ObjectNode sender = payload.putObject("sender");
            sender.put("name", senderName);
            sender.put("email", fromEmail);

            payload.putArray("to").addObject().put("email", to);

            if (replyTo != null && !replyTo.isBlank()) {
                payload.putObject("replyTo").put("email", replyTo);
            }

            payload.put("subject", subject);
            payload.put("htmlContent", html);

            if (attachment != null) {
                ObjectNode file = payload.putArray("attachment").addObject();
                file.put("content", Base64.getEncoder().encodeToString(Files.readAllBytes(attachment.toPath())));
                file.put("name", attachment.getName());
            }

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(BREVO_API_ENDPOINT))
                    .timeout(Duration.ofSeconds(20))
                    .header("accept", "application/json")
                    .header("content-type", "application/json")
                    .header("api-key", mailCredential.trim())
                    .POST(HttpRequest.BodyPublishers.ofString(
                            objectMapper.writeValueAsString(payload), StandardCharsets.UTF_8))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                log.info("Brevo REST API delivered email to {} (HTTP {})", to, response.statusCode());
                return true;
            }

            log.warn("Brevo REST API rejected email to {} (HTTP {}): {}. Falling back to SMTP.",
                    to, response.statusCode(), response.body());
            return false;

        } catch (InterruptedException e) {
            // Restore the interrupt flag so the async executor can wind the thread down.
            Thread.currentThread().interrupt();
            log.error("Brevo REST API call interrupted while emailing {}. Falling back to SMTP.", to, e);
            return false;
        } catch (Exception e) {
            log.error("Brevo REST API call failed for {}. Falling back to SMTP.", to, e);
            return false;
        }
    }

    /**
     * Delivers via JavaMail. In production this must run over SMTPS (port 465);
     * port 587 STARTTLS is blocked by most cloud PaaS providers and will hang
     * until the socket times out.
     */
    private void sendViaSmtp(String to, String subject, String html, String replyTo, File attachment) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            // multipart=true is required for attachments and for HTML alternatives.
            MimeMessageHelper helper = new MimeMessageHelper(message, true, StandardCharsets.UTF_8.name());

            helper.setFrom(fromEmail, senderName);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(html, true);

            if (replyTo != null && !replyTo.isBlank()) {
                helper.setReplyTo(replyTo);
            }
            if (attachment != null) {
                helper.addAttachment(attachment.getName(), new FileSystemResource(attachment));
            }

            mailSender.send(message);
            log.info("SMTP delivered email to {}", to);

        } catch (Exception e) {
            log.error("SMTP delivery failed for {} (subject '{}')", to, subject, e);
        }
    }

    // ------------------------------------------------------------------
    // Helpers
    // ------------------------------------------------------------------

    /**
     * Returns the public site origin without a trailing slash, so callers can
     * append a rooted path without producing a double slash.
     *
     * <p>
     * FUTURE CUSTOM DOMAIN: this resolves from {@code app.email.frontend-url}
     * (env {@code APP_FRONTEND_URL}). Point that at the custom domain — e.g.
     * {@code https://saturn-rnd.com} — and verification links follow
     * automatically; no code change required.
     */
    private String resolveFrontendUrl() {
        String url = (frontendUrl == null || frontendUrl.isBlank())
                ? "http://localhost:3000"
                : frontendUrl.trim();
        return url.endsWith("/") ? url.substring(0, url.length() - 1) : url;
    }

    /**
     * Returns the public REST API backend origin without a trailing slash for
     * 1-click acknowledge button endpoints.
     */
    private String resolveBackendUrl() {
        String url = (backendUrl == null || backendUrl.isBlank())
                ? "http://localhost:8080"
                : backendUrl.trim();
        return url.endsWith("/") ? url.substring(0, url.length() - 1) : url;
    }

    /**
     * Resolves an attachment path to a readable {@link File}.
     *
     * @return the file, or {@code null} when the path is absent or missing on
     *         disk — a vanished CV must not abort the admin notification
     */
    private File resolveAttachment(String path) {
        if (path == null || path.isBlank()) {
            return null;
        }
        File file = new File(path);
        if (!file.isFile()) {
            log.warn("Attachment path '{}' does not exist on disk; sending notification without it.", path);
            return null;
        }
        return file;
    }
}
