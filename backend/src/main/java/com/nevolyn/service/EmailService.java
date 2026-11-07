package com.nevolyn.service;

import com.nevolyn.service.mail.EmailMessage;
import com.nevolyn.service.mail.EmailTemplateRenderer;
import jakarta.annotation.PostConstruct;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.core.env.Profiles;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.io.File;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;

/**
 * Non-blocking asynchronous email delivery service for the NEVOLYN platform.
 *
 * <p>Adheres strictly to the NEVOLYN Transactional Mail Architecture:
 * <ul>
 *   <li><strong>Zero Inline HTML:</strong> 100% externalized templates rendered via
 *       {@link EmailTemplateRenderer}.</li>
 *   <li><strong>Defensive Immutable Packaging:</strong> Messages packaged as immutable
 *       {@link EmailMessage} records.</li>
 *   <li><strong>MIME Hierarchy:</strong> {@code multipart/mixed} containing
 *       {@code multipart/alternative} (clean plain-text fallback + HTML) with binary attachments.</li>
 *   <li><strong>Direct Reply-To:</strong> Admin notification emails set {@code Reply-To}
 *       to the submitter.</li>
 *   <li><strong>Fail-Fast Production Guard:</strong> Halts startup in {@code prod} if
 *       credentials are missing.</li>
 * </ul>
 *
 * @author NEVOLYN Engineering Standard
 * @version 1.1.0
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;
    private final EmailTemplateRenderer templateRenderer;
    private final Environment environment;

    @Value("${app.mail.from-address:${app.email.from:info@nevolyn.com}}")
    private String fromEmail;

    @Value("${app.mail.admin-address:${app.email.admin:info@nevolyn.com}}")
    private String adminEmail;

    @Value("${app.frontend-url:${app.email.frontend-url:http://localhost:3000}}")
    private String frontendUrl;

    @Value("${app.backend-url:${app.email.backend-url:http://localhost:8080}}")
    private String backendUrl;

    @Value("${app.mail.sender-name:${app.email.sender-name:NEVOLYN}}")
    private String senderName;

    @Value("${spring.mail.password:}")
    private String mailCredential;

    @PostConstruct
    void validateProductionCredentials() {
        if (environment.acceptsProfiles(Profiles.of("prod", "production"))
                && (mailCredential == null || mailCredential.isBlank())) {
            throw new IllegalStateException("Production deployment missing required SPRING_MAIL_PASSWORD credential!");
        }
    }

    // ------------------------------------------------------------------
    // Step 1 — Submission confirmation receipt
    // ------------------------------------------------------------------

    @Async
    public void sendSenderConfirmationEmail(SubmissionDetails details) {
        log.info("Preparing Submission Confirmation Email for '{}' [Ref: {}, Type: {}]",
                maskEmail(details.email()), details.referenceCode(), details.type().label());

        String templatePath = details.type().emailTemplate(SubmissionType.MailKind.RECEIPT);

        Map<String, String> values = new HashMap<>();
        values.put("referenceCode", details.referenceCode());
        values.put("trackingId", details.referenceCode());
        values.put("name", details.name() != null ? details.name() : "Valued Partner");
        values.put("adminEmail", adminEmail);

        if (details.type() == SubmissionType.JOB_APPLICATION) {
            values.put("resumeFileName", details.resumeFileName() != null ? details.resumeFileName() : "Uploaded Resume / CV");
            values.put("nid", details.nid() != null && !details.nid().isBlank() ? details.nid() : "N/A");
        } else {
            values.put("subject", details.subject() != null ? details.subject() : "General Inquiry");
            values.put("message", details.message() != null ? details.message() : "Your inquiry has been successfully registered.");
        }

        String htmlBody = templateRenderer.render(templatePath, values);
        String plainText = templateRenderer.generatePlainText(htmlBody);

        String subject = (details.type() == SubmissionType.JOB_APPLICATION)
                ? "[NEVOLYN] Application Received [Ref: " + details.referenceCode() + "]"
                : "[NEVOLYN] Inquiry Received [Ref: " + details.referenceCode() + "]";

        byte[] attachmentBytes = null;
        String attachmentName = null;
        if (details.type() == SubmissionType.JOB_APPLICATION && details.resumePath() != null) {
            File attachment = resolveAttachment(details.resumePath());
            if (attachment != null) {
                try {
                    attachmentBytes = Files.readAllBytes(attachment.toPath());
                    attachmentName = details.resumeFileName() != null ? details.resumeFileName() : attachment.getName();
                } catch (Exception e) {
                    log.warn("Could not read attachment for candidate confirmation: {}", e.getMessage());
                }
            }
        }

        EmailMessage message = EmailMessage.builder()
                .to(details.email())
                .subject(subject)
                .htmlBody(htmlBody)
                .plainTextBody(plainText)
                .replyTo(adminEmail)
                .attachment(attachmentName, attachmentBytes)
                .build();

        dispatch(message);
    }

    @Async
    public void sendSenderVerificationEmail(String recipientEmail, String name, String trackingId, String type) {
        SubmissionType subType = "application".equalsIgnoreCase(type)
                ? SubmissionType.JOB_APPLICATION
                : SubmissionType.CONTACT_INQUIRY;

        SubmissionDetails details = new SubmissionDetails(
                subType,
                trackingId,
                name,
                recipientEmail,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                false
        );
        sendSenderConfirmationEmail(details);
    }

    // ------------------------------------------------------------------
    // Step 2 — Admin notification alert dossier
    // ------------------------------------------------------------------

    @Async
    public void sendAdminNotificationEmail(SubmissionDetails details) {
        log.info("Preparing Admin Notification Email for trackingId='{}', type='{}'",
                details.referenceCode(), details.type().label());

        String templatePath = details.type().emailTemplate(SubmissionType.MailKind.ADMIN_NOTIFICATION);
        File attachment = resolveAttachment(details.resumePath());
        String acknowledgeUrl = resolveBackendUrl() + "/api/v1/acknowledge?trackingId=" + details.referenceCode();

        LocalDateTime submitTime = details.submittedAt() != null ? details.submittedAt() : LocalDateTime.now(ZoneOffset.UTC);
        String nowStr = submitTime.format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")) + " UTC";

        Map<String, String> values = new HashMap<>();
        values.put("referenceCode", details.referenceCode());
        values.put("trackingId", details.referenceCode());
        values.put("acknowledgeUrl", acknowledgeUrl);
        values.put("name", details.name() != null ? details.name() : "Anonymous");
        values.put("email", details.email());
        values.put("userEmail", details.email());
        values.put("submittedAt", nowStr);

        if (details.type() == SubmissionType.JOB_APPLICATION) {
            values.put("phone", details.phone() != null && !details.phone().isBlank() ? details.phone() : "N/A");
            values.put("address", details.address() != null && !details.address().isBlank() ? details.address() : "N/A");
            values.put("nid", details.nid() != null && !details.nid().isBlank() ? details.nid() : "N/A");
            values.put("linkedin", formatSocialUrl(details.linkedin()));
            values.put("github", formatSocialUrl(details.github()));
            values.put("website", formatSocialUrl(details.website()));
            values.put("links", details.links() != null && !details.links().isBlank() ? details.links() : "N/A");
            values.put("reason", details.message() != null ? details.message() : "");
            values.put("resumeFileName", details.resumeFileName() != null ? details.resumeFileName() : (attachment != null ? attachment.getName() : "None"));
        } else {
            values.put("subject", details.subject() != null ? details.subject() : "General Inquiry");
            values.put("message", details.message() != null ? details.message() : "");
        }

        String htmlBody = templateRenderer.render(templatePath, values, Set.of("acknowledgeUrl", "linkedin", "github", "website"));
        String plainText = templateRenderer.generatePlainText(htmlBody);

        String subjectLine = (details.type() == SubmissionType.JOB_APPLICATION)
                ? "[NEVOLYN Alert] New Job Application: " + details.name() + " [Ref: " + details.referenceCode() + "]"
                : "[NEVOLYN Alert] New Contact Inquiry: " + details.name() + " [Ref: " + details.referenceCode() + "]";

        byte[] attachmentBytes = null;
        String attachmentName = null;
        if (attachment != null) {
            try {
                attachmentBytes = Files.readAllBytes(attachment.toPath());
                attachmentName = details.resumeFileName() != null ? details.resumeFileName() : attachment.getName();
            } catch (Exception e) {
                log.warn("Could not read attachment file bytes from '{}': {}", details.resumePath(), e.getMessage());
            }
        }

        EmailMessage message = EmailMessage.builder()
                .to(adminEmail)
                .subject(subjectLine)
                .htmlBody(htmlBody)
                .plainTextBody(plainText)
                .replyTo(details.email())
                .attachment(attachmentName, attachmentBytes)
                .build();

        dispatch(message);
    }

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

        boolean isApp = formType != null && formType.toLowerCase().contains("application");
        SubmissionDetails details = new SubmissionDetails(
                isApp ? SubmissionType.JOB_APPLICATION : SubmissionType.CONTACT_INQUIRY,
                trackingId,
                name,
                userEmail,
                subject,
                messageContent,
                phone,
                address,
                links,
                attachmentFilePath,
                attachmentFilePath != null ? new File(attachmentFilePath).getName() : null,
                null,
                false
        );
        sendAdminNotificationEmail(details);
    }

    // ------------------------------------------------------------------
    // Step 3 — User acknowledgement follow-up
    // ------------------------------------------------------------------

    public boolean sendUserAcknowledgementEmail(SubmissionDetails details) {
        log.info("Preparing User Acknowledgement Email for '{}' [Ref: {}]",
                maskEmail(details.email()), details.referenceCode());

        String templatePath = details.type().emailTemplate(SubmissionType.MailKind.ACKNOWLEDGEMENT);

        Map<String, String> values = new HashMap<>();
        values.put("referenceCode", details.referenceCode());
        values.put("trackingId", details.referenceCode());
        values.put("name", details.name() != null ? details.name() : "Valued Partner");
        values.put("adminEmail", adminEmail);
        if (details.type() == SubmissionType.CONTACT_INQUIRY) {
            values.put("subject", details.subject() != null ? details.subject() : "General Inquiry");
        }

        String htmlBody = templateRenderer.render(templatePath, values);
        String plainText = templateRenderer.generatePlainText(htmlBody);

        String subjectLine = (details.type() == SubmissionType.JOB_APPLICATION)
                ? "[NEVOLYN] Application Under Review [Ref: " + details.referenceCode() + "]"
                : "[NEVOLYN] Inquiry Acknowledged [Ref: " + details.referenceCode() + "]";

        EmailMessage message = EmailMessage.builder()
                .to(details.email())
                .subject(subjectLine)
                .htmlBody(htmlBody)
                .plainTextBody(plainText)
                .replyTo(adminEmail)
                .build();

        return dispatch(message);
    }

    public boolean sendUserAcknowledgementEmail(String recipientEmail, String name, String trackingId, String formType) {
        return sendUserAcknowledgementEmail(recipientEmail, name, trackingId, formType, null);
    }

    public boolean sendUserAcknowledgementEmail(String recipientEmail, String name, String trackingId, String formType, String subject) {
        boolean isApp = formType != null && formType.toLowerCase().contains("application");
        String effectiveSubject = (subject != null && !subject.isBlank())
                ? subject.trim()
                : (isApp ? "Job Application Submission" : "General Inquiry");

        SubmissionDetails details = new SubmissionDetails(
                isApp ? SubmissionType.JOB_APPLICATION : SubmissionType.CONTACT_INQUIRY,
                trackingId,
                name,
                recipientEmail,
                effectiveSubject,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                false
        );
        return sendUserAcknowledgementEmail(details);
    }

    /**
     * Sends the official onboarding email with credentials and setup instructions directly to new employees/admins.
     */
    @Async
    public void sendOnboardingCredentialsEmail(
            String toEmail,
            String fullName,
            String username,
            String employeeId,
            String designation,
            String initialPassword,
            String joiningDate
    ) {
        if (toEmail == null || toEmail.isBlank()) return;

        String portalUrl = (frontendUrl != null && !frontendUrl.isBlank())
                ? frontendUrl.trim().replaceAll("/+$", "") + "/office/login"
                : "https://nevolyn.com/office/login";

        String subject = "[NEVOLYN] Welcome " + fullName + " — Office Portal Credentials";

        String plainText = String.format("""
Dear %s,

Welcome to NEVOLYN. Your official Office Portal account has been provisioned.

OFFICIAL ACCESS CREDENTIALS:
• Portal Login : %s
• Username     : %s
• Employee ID  : %s
• Designation  : %s
• Initial Pass : %s

MANDATORY FIRST-LOGIN ACTIONS (OFFICE PORTAL):
For personal data privacy, administrators cannot set or view your phone number, bank details, profile photo, or password. Please log in immediately and open "Profile & Security" to:
1. Add your personal phone number
2. Upload your official profile photo (saved automatically as %s-photo)
3. Provide your Primary and Secondary bank details (for direct deposit payroll)
4. Change your temporary password to a confidential password

PUBLIC WEBSITE PROFILE DETAILS (REPLY TO THIS EMAIL):
For your official team profile on nevolyn.com:
• Role Overview (Paragraph 1) & Responsibilities will be assigned directly by NEVOLYN.
• Please reply to this email with:
  1. Bio: 1 concise sentence summary
  2. Education & Specialization (Paragraph 2): University, degrees, core engineering background
  3. Academic Research & Key Achievements (Paragraph 3): Thesis, papers, awards, notable projects
  4. Professional & Research Profiles:
     - LinkedIn: [URL]
     - GitHub: [URL]
     - Personal Portfolio: [URL]
     - Google Scholar: [URL + Author Name]
     - ORCID: [URL]

Operations & Personnel Administration
NEVOLYN • https://nevolyn.com
""",
                fullName, portalUrl, username, employeeId,
                designation != null ? designation : "Staff Member",
                initialPassword, username);

        String htmlBody = String.format("""
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/><style>
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.5; color: #0f172a; margin: 0; padding: 24px; background: #f8fafc; }
.card { max-width: 560px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 28px; box-shadow: 0 4px 20px rgba(0,0,0,0.04); }
.header { border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 20px; }
.logo { font-size: 20px; font-weight: 900; color: #0f172a; letter-spacing: -0.5px; }
.sub { font-size: 11px; text-transform: uppercase; color: #0d9488; font-weight: 700; margin-top: 2px; }
.cred-box { background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 12px; padding: 14px; margin: 16px 0; }
.row { display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px dashed #e2e8f0; font-size: 12px; }
.row:last-child { border-bottom: none; }
.label { color: #64748b; font-weight: 600; }
.val { font-family: monospace; font-weight: 700; color: #0f172a; }
.pass-pill { background: #ecfdf5; border: 1px solid #a7f3d0; padding: 8px 12px; border-radius: 8px; font-family: monospace; font-size: 15px; font-weight: 900; color: #047857; margin-top: 10px; text-align: center; }
.notice { background: #fffbeb; border: 1px solid #fde68a; border-radius: 10px; padding: 12px; font-size: 12px; color: #92400e; margin: 16px 0; line-height: 1.5; }
.profile-box { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 12px; font-size: 12px; color: #166534; margin: 16px 0; line-height: 1.5; }
.steps { margin: 8px 0; padding-left: 20px; font-size: 12px; }
.steps li { margin-bottom: 3px; }
.btn { display: inline-block; background: #0f172a; color: #ffffff !important; padding: 10px 20px; border-radius: 8px; font-weight: 700; text-decoration: none; font-size: 13px; margin: 14px 0; }
.footer { margin-top: 20px; padding-top: 12px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; }
</style></head>
<body>
<div class="card">
  <div class="header">
    <div class="logo">NEVOLYN</div>
    <div class="sub">Office Portal Account Provisioning</div>
  </div>
  <p>Dear <strong>%s</strong>,</p>
  <p>Welcome to NEVOLYN. Your official Office Portal account has been provisioned.</p>
  <div class="cred-box">
    <div class="row"><span class="label">Username:</span><span class="val">%s</span></div>
    <div class="row"><span class="label">Employee ID:</span><span class="val">%s</span></div>
    <div class="row"><span class="label">Designation:</span><span class="val">%s</span></div>
    <div class="pass-pill">Temporary Password: %s</div>
  </div>
  <center><a href="%s" class="btn">Log In to Office Portal</a></center>
  <div class="notice">
    <strong>Mandatory First-Login Actions:</strong><br/>
    For personal data privacy, administrators cannot set or view your phone number, bank details, profile photo, or password. Please log in immediately and open <strong>Profile &amp; Security</strong> to:
    <ol class="steps">
      <li>Add your personal phone number.</li>
      <li>Upload your official profile photo (saved as %s-photo).</li>
      <li>Provide your Primary and Secondary bank details for payroll.</li>
      <li>Update your temporary password.</li>
    </ol>
  </div>
  <div class="profile-box">
    <strong>Official Website Profile Submission (Reply to this Email):</strong><br/>
    NEVOLYN will provide your Role Overview (Paragraph 1) and Key Responsibilities.<br/>
    Please reply to this email with:
    <ol class="steps">
      <li>1-sentence Bio summary</li>
      <li>Education &amp; Specialization (Paragraph 2)</li>
      <li>Academic Research &amp; Key Achievements (Paragraph 3)</li>
      <li>Profiles: LinkedIn, GitHub, Portfolio, Google Scholar, ORCID</li>
    </ol>
  </div>
  <div class="footer">
    Operations &amp; Personnel Administration &bull; NEVOLYN &bull; https://nevolyn.com
  </div>
</div>
</body></html>
""",
                fullName, username, employeeId,
                designation != null ? designation : "Staff Member",
                initialPassword, portalUrl);

        EmailMessage message = EmailMessage.builder()
                .to(toEmail)
                .subject(subject)
                .htmlBody(htmlBody)
                .plainTextBody(plainText)
                .replyTo(adminEmail)
                .build();

        dispatch(message);
    }

    // ------------------------------------------------------------------
    // Transport & Dispatch
    // ------------------------------------------------------------------

    private boolean dispatch(EmailMessage message) {
        if (mailCredential == null || mailCredential.isBlank()) {
            if (environment != null && environment.acceptsProfiles(org.springframework.core.env.Profiles.of("test", "default", "local"))) {
                log.info("[WEBMAIL SIMULATED] To: {} | Subject: '{}' | Attachment: {} - set SPRING_MAIL_PASSWORD to send for real",
                        maskEmail(message.to()), message.subject(),
                        message.hasAttachment() ? message.attachmentFilename() : "None");
                return true;
            }
            log.warn("[WEBMAIL NOT SENT] To: {} | Subject: '{}' - SPRING_MAIL_PASSWORD is not configured, email was NOT sent",
                    maskEmail(message.to()), message.subject());
            return false;
        }

        return sendViaSmtp(message);
    }

    private boolean sendViaSmtp(EmailMessage message) {
        if (mailSender == null) {
            log.error("Cannot send email to {}: JavaMailSender bean is unavailable.", maskEmail(message.to()));
            return false;
        }

        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, StandardCharsets.UTF_8.name());

            helper.setFrom(fromEmail, senderName);
            helper.setTo(message.to());
            helper.setSubject(message.subject());

            helper.setText(message.htmlBody(), true);

            if (message.hasReplyTo()) {
                helper.setReplyTo(message.replyTo());
            }

            if (message.hasAttachment()) {
                helper.addAttachment(message.attachmentFilename(), new ByteArrayResource(message.attachmentBytes()));
            }

            mailSender.send(mimeMessage);
            log.info("Webmail SMTP delivered email to {} [Subject: '{}']", maskEmail(message.to()), message.subject());
            return true;

        } catch (Exception e) {
            log.error("SMTP delivery failed for {} [Subject: '{}']: {}", maskEmail(message.to()), message.subject(), e.getMessage(), e);
            return false;
        }
    }

    private String resolveBackendUrl() {
        String url = (backendUrl == null || backendUrl.isBlank()) ? "http://localhost:8080" : backendUrl.trim();
        return url.endsWith("/") ? url.substring(0, url.length() - 1) : url;
    }

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

    private static String formatSocialUrl(String url) {
        if (url == null || url.trim().isBlank()) {
            return "N/A";
        }
        String cleanUrl = url.trim();
        String href = cleanUrl.startsWith("http://") || cleanUrl.startsWith("https://")
                ? cleanUrl
                : "https://" + cleanUrl;
        return "<a href=\"" + href + "\" target=\"_blank\" style=\"color:#0284c7; font-weight:600; text-decoration:underline; word-break:break-all;\">" + cleanUrl + "</a>";
    }
}
