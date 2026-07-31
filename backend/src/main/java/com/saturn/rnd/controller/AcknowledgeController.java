package com.saturn.rnd.controller;

import com.saturn.rnd.dto.ApiResponse;
import com.saturn.rnd.model.ContactInquiry;
import com.saturn.rnd.model.JobApplication;
import com.saturn.rnd.repository.ContactInquiryRepository;
import com.saturn.rnd.repository.JobApplicationRepository;
import com.saturn.rnd.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Optional;

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

    @GetMapping(value = "/api/v1/acknowledge", produces = MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<String> acknowledgeSubmission(@RequestParam("trackingId") String trackingId) {
        log.info("Processing 1-click automatic email acknowledgment for trackingId='{}'", trackingId);

        String recipientName = "User";
        String recipientEmail = "";
        String typeLabel = "Submission";
        boolean found = false;

        if (trackingId != null && trackingId.toUpperCase().startsWith("APP-")) {
            Optional<JobApplication> appOpt = applicationRepository.findByApplicationId(trackingId);
            if (appOpt.isPresent()) {
                JobApplication app = appOpt.get();
                recipientName = app.getName();
                recipientEmail = app.getEmail();
                typeLabel = "Job Application";
                emailService.sendUserAcknowledgementEmail(recipientEmail, recipientName, trackingId, typeLabel);
                found = true;
            }
        } else if (trackingId != null) {
            Optional<ContactInquiry> inquiryOpt = contactRepository.findByInquiryId(trackingId);
            if (inquiryOpt.isPresent()) {
                ContactInquiry inquiry = inquiryOpt.get();
                recipientName = inquiry.getName();
                recipientEmail = inquiry.getEmail();
                typeLabel = "Contact Inquiry";
                emailService.sendUserAcknowledgementEmail(recipientEmail, recipientName, trackingId, typeLabel);
                found = true;
            }
        }

        String html;
        if (found) {
            html = """
                <!DOCTYPE html>
                <html>
                <head>
                  <meta charset="UTF-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <title>Acknowledgement Email Sent — Saturn R&D</title>
                  <style>
                    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #030712; color: #f1f5f9; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 24px; }
                    .card { background: linear-gradient(145deg, #0b172a 0%, #070f1e 100%); border: 1px solid #1e3a8a; border-radius: 24px; padding: 40px; text-align: center; max-width: 500px; width: 100%; box-shadow: 0 20px 40px rgba(0,0,0,0.6); }
                    .icon-badge { width: 64px; h-64px; background: rgba(5, 150, 105, 0.2); border: 1px solid rgba(5, 150, 105, 0.4); color: #34d399; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px auto; font-size: 28px; }
                    h1 { color: #38bdf8; font-size: 24px; font-weight: 800; margin: 0 0 12px 0; }
                    p { color: #94a3b8; font-size: 15px; line-height: 1.6; margin: 0 0 20px 0; }
                    .details { background: #070e1c; border: 1px solid #1e293b; border-radius: 12px; padding: 16px; font-size: 14px; color: #cbd5e1; text-align: left; }
                    .code { color: #f97316; font-weight: 700; }
                  </style>
                </head>
                <body>
                  <div class="card">
                    <div class="icon-badge">✓</div>
                    <h1>Acknowledgement Sent!</h1>
                    <p>The official receipt email has been automatically transmitted to the submitter.</p>
                    <div class="details">
                      • <strong>Reference Code:</strong> <span class="code">%s</span><br/>
                      • <strong>Recipient Name:</strong> %s<br/>
                      • <strong>Destination Email:</strong> %s
                    </div>
                  </div>
                </body>
                </html>
                """.formatted(trackingId, recipientName, recipientEmail);
        } else {
            html = """
                <!DOCTYPE html>
                <html>
                <head>
                  <meta charset="UTF-8">
                  <title>Submission Not Found — Saturn R&D</title>
                  <style>
                    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #030712; color: #f1f5f9; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 24px; }
                    .card { background: #0b172a; border: 1px solid #991b1b; border-radius: 24px; padding: 40px; text-align: center; max-width: 480px; }
                    h1 { color: #f87171; font-size: 22px; }
                    p { color: #94a3b8; font-size: 14px; }
                  </style>
                </head>
                <body>
                  <div class="card">
                    <h1>Reference Code Not Found</h1>
                    <p>Could not locate submission record for tracking code <strong>%s</strong>.</p>
                  </div>
                </body>
                </html>
                """.formatted(trackingId);
        }

        return ResponseEntity.ok(html);
    }
}
