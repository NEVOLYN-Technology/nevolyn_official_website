package com.saturn.rnd.controller;

import com.saturn.rnd.model.ContactInquiry;
import com.saturn.rnd.model.JobApplication;
import com.saturn.rnd.repository.ContactInquiryRepository;
import com.saturn.rnd.repository.JobApplicationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.nio.charset.StandardCharsets;
import java.util.Optional;

import com.saturn.rnd.service.EmailService;

/**
 * REST Controller for 1-click automatic email acknowledgment.
 * Triggered directly from Admin Notification emails.
 */
@Slf4j
@RestController
@RequiredArgsConstructor
public class AcknowledgeController {

    private final ContactInquiryRepository contactRepository;
    private final JobApplicationRepository applicationRepository;
    private final EmailService emailService;

    @Transactional
    @RequestMapping(value = "/api/v1/acknowledge", method = { RequestMethod.GET, RequestMethod.POST }, produces = MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<String> acknowledgeSubmission(@RequestParam(value = "trackingId", required = false) String trackingId) {
        String cleanId = trackingId != null ? trackingId.trim() : "";
        log.info("Processing 1-click automatic email acknowledgment for trackingId='{}'", cleanId);

        String recipientName = "User";
        String recipientEmail = "";
        String typeLabel = "Submission";
        boolean found = false;

        try {
            if (!cleanId.isEmpty()) {
                // Try JobApplication first if ID starts with APP or APP-
                if (cleanId.toUpperCase().startsWith("APP")) {
                    Optional<JobApplication> appOpt = applicationRepository.findByApplicationId(cleanId);
                    if (appOpt.isPresent()) {
                        JobApplication app = appOpt.get();
                        recipientName = app.getName();
                        recipientEmail = app.getEmail();
                        typeLabel = "Job Application";
                        found = true;
                    }
                }
                
                // Try ContactInquiry if not found yet
                if (!found) {
                    Optional<ContactInquiry> inquiryOpt = contactRepository.findByInquiryId(cleanId);
                    if (inquiryOpt.isPresent()) {
                        ContactInquiry inquiry = inquiryOpt.get();
                        recipientName = inquiry.getName();
                        recipientEmail = inquiry.getEmail();
                        typeLabel = "Contact Inquiry";
                        found = true;
                    }
                }

                // Fallback attempt for JobApplication if not starting with APP
                if (!found && !cleanId.toUpperCase().startsWith("APP")) {
                    Optional<JobApplication> appOpt = applicationRepository.findByApplicationId(cleanId);
                    if (appOpt.isPresent()) {
                        JobApplication app = appOpt.get();
                        recipientName = app.getName();
                        recipientEmail = app.getEmail();
                        typeLabel = "Job Application";
                        found = true;
                    }
                }
            }
        } catch (Exception e) {
            log.error("Error looking up submission record for trackingId='{}'", cleanId, e);
        }

        String html;
        if (found) {
            log.info("Dispatching user acknowledgment email for trackingId='{}' ({}) to '{}'", cleanId, typeLabel, recipientEmail);
            emailService.sendUserAcknowledgementEmail(recipientEmail, recipientName, cleanId, typeLabel);

            html = """
                <!DOCTYPE html>
                <html>
                <head>
                  <meta charset="UTF-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <title>Acknowledgement Email Sent — Saturn R&D</title>
                  <style>
                    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; color: #1e293b; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 24px; }
                    .card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 40px; text-align: center; max-width: 500px; width: 100%%; box-shadow: 0 10px 25px rgba(0,0,0,0.08); }
                    .icon-badge { width: 64px; height: 64px; background: #dcfce7; border: 1px solid #86efac; color: #15803d; border-radius: 50%%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px auto; font-size: 28px; font-weight: bold; }
                    h1 { color: #0f172a; font-size: 24px; font-weight: 800; margin: 0 0 12px 0; }
                    p { color: #475569; font-size: 15px; line-height: 1.6; margin: 0 0 20px 0; }
                    .details { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; font-size: 14px; color: #334155; text-align: left; line-height: 1.8; }
                    .code { color: #ea580c; font-weight: 700; }
                  </style>
                </head>
                <body>
                  <div class="card">
                    <div class="icon-badge">✓</div>
                    <h1>Acknowledgement Sent!</h1>
                    <p>The official receipt email has been automatically transmitted to the submitter.</p>
                    <div class="details">
                      • <strong>Submission Type:</strong> %s<br/>
                      • <strong>Reference Code:</strong> <span class="code">%s</span><br/>
                      • <strong>Recipient Name:</strong> %s<br/>
                      • <strong>Destination Email:</strong> %s
                    </div>
                  </div>
                </body>
                </html>
                """.formatted(typeLabel, cleanId, recipientName, recipientEmail);
        } else {
            html = """
                <!DOCTYPE html>
                <html>
                <head>
                  <meta charset="UTF-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <title>Submission Not Found — Saturn R&D</title>
                  <style>
                    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; color: #1e293b; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 24px; }
                    .card { background: #ffffff; border: 1px solid #fecaca; border-radius: 16px; padding: 40px; text-align: center; max-width: 480px; width: 100%%; box-shadow: 0 10px 25px rgba(0,0,0,0.08); }
                    .icon-badge { width: 64px; height: 64px; background: #fef2f2; border: 1px solid #fca5a5; color: #dc2626; border-radius: 50%%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px auto; font-size: 28px; font-weight: bold; }
                    h1 { color: #991b1b; font-size: 22px; margin: 0 0 12px 0; }
                    p { color: #475569; font-size: 14px; line-height: 1.6; }
                  </style>
                </head>
                <body>
                  <div class="card">
                    <div class="icon-badge">!</div>
                    <h1>Reference Code Not Found</h1>
                    <p>Could not locate active submission record for reference code <strong>%s</strong>.</p>
                  </div>
                </body>
                </html>
                """.formatted(cleanId);
        }

        return ResponseEntity.ok()
                .contentType(new MediaType(MediaType.TEXT_HTML, StandardCharsets.UTF_8))
                .body(html);
    }
}
