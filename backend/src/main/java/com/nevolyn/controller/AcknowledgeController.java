package com.nevolyn.controller;

import com.nevolyn.service.EmailService;
import com.nevolyn.service.SubmissionDetails;
import com.nevolyn.service.SubmissionService;
import com.nevolyn.service.SubmissionType;
import com.nevolyn.service.mail.EmailTemplateRenderer;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

/**
 * One-click acknowledgement flow for submissions, triggered from admin emails.
 *
 * <ul>
 *   <li>{@code GET} is read-only and scanner-safe: it renders a pre-flight
 *       confirmation page and never mutates state or sends mail.</li>
 *   <li>{@code POST} (or {@code GET ?confirm=true} for legacy direct links) performs the
 *       acknowledgement exactly once, persisted atomically in the database.</li>
 *   <li>Repeated requests safely render "Already Acknowledged" with zero duplicate mailings.</li>
 *   <li>All markup lives in {@code templates/web/}; this class holds none.</li>
 * </ul>
 */
@Slf4j
@RestController
@RequiredArgsConstructor
public class AcknowledgeController {

    private static final String ACKNOWLEDGE_PATH = "/api/v1/acknowledge";
    private static final String NOT_FOUND_TEMPLATE = "templates/web/contact-acknowledge-result.html";

    private final SubmissionService submissionService;
    private final EmailService emailService;
    private final EmailTemplateRenderer templateRenderer;

    @GetMapping(value = ACKNOWLEDGE_PATH, produces = MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<String> showPreflight(
            @RequestParam(value = "trackingId", required = false) String trackingId,
            @RequestParam(value = "confirm", defaultValue = "false") boolean confirm) {

        String code = normalise(trackingId);
        log.info("GET {} trackingId='{}' confirm={}", ACKNOWLEDGE_PATH, code, confirm);

        return confirm ? acknowledge(code) : preflight(code);
    }

    @PostMapping(value = ACKNOWLEDGE_PATH, produces = MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<String> acknowledgeSubmission(
            @RequestParam(value = "trackingId", required = false) String trackingId) {

        String code = normalise(trackingId);
        log.info("POST {} trackingId='{}'", ACKNOWLEDGE_PATH, code);
        return acknowledge(code);
    }

    private ResponseEntity<String> preflight(String code) {
        Optional<SubmissionDetails> found = submissionService.findByReference(code);
        if (found.isEmpty()) {
            return notFound(code);
        }
        SubmissionDetails submission = found.get();
        if (submission.acknowledged()) {
            return alreadyAcknowledged(submission);
        }

        Map<String, String> values = Map.of(
                "actionUrl", ACKNOWLEDGE_PATH + "?trackingId=" + submission.referenceCode(),
                "referenceCode", submission.referenceCode(),
                "name", submission.name(),
                "email", submission.email(),
                "subject", submission.subject(),
                "phone", orDefault(submission.phone(), "Not provided"),
                "resumeFileName", orDefault(submission.resumeFileName(), "resume.pdf"));

        return html(templateRenderer.render(submission.type().confirmTemplate(), values, Set.of("actionUrl")));
    }

    private ResponseEntity<String> acknowledge(String code) {
        Optional<SubmissionDetails> found = submissionService.findByReference(code);
        if (found.isEmpty()) {
            return notFound(code);
        }
        SubmissionDetails submission = found.get();

        // Atomically transition state in database
        boolean updated = submissionService.markAcknowledged(submission);
        if (!updated) {
            return alreadyAcknowledged(submission);
        }

        log.info("Dispatching acknowledgement for {} '{}'",
                submission.type().label(), submission.referenceCode());
        emailService.sendUserAcknowledgementEmail(
                submission.email(), submission.name(), submission.referenceCode(), submission.type().label());

        return result(submission,
                "Acknowledgement Sent!",
                "ACKNOWLEDGED",
                "The official receipt email has been automatically transmitted to " + submission.name() + ".",
                submission.type() == SubmissionType.JOB_APPLICATION
                        ? "Application has been moved to active review and the candidate has been notified."
                        : "Contact inquiry has been marked as acknowledged and the visitor has been notified.");
    }

    private ResponseEntity<String> alreadyAcknowledged(SubmissionDetails submission) {
        return result(submission,
                "Already Acknowledged",
                "ALREADY ACKNOWLEDGED",
                "Reference " + submission.referenceCode() + " for " + submission.name()
                        + " has already been acknowledged.",
                "No additional email was sent. An acknowledgement was already dispatched to "
                        + submission.email() + ".");
    }

    private ResponseEntity<String> result(SubmissionDetails submission, String title, String badge,
                                          String message, String detailNote) {
        Map<String, String> values = Map.of(
                "title", title,
                "statusBadge", badge,
                "referenceCode", submission.referenceCode(),
                "name", submission.name(),
                "email", submission.email(),
                "message", message,
                "detailNote", detailNote);
        return html(templateRenderer.render(submission.type().resultTemplate(), values));
    }

    private ResponseEntity<String> notFound(String code) {
        Map<String, String> values = Map.of(
                "title", "Reference Code Not Found",
                "statusBadge", "NOT FOUND",
                "referenceCode", code.isEmpty() ? "N/A" : code,
                "name", "Unknown",
                "email", "N/A",
                "message", "Could not locate an active submission for the given reference code.",
                "detailNote", "Please verify the reference code, or contact NEVOLYN administration.");
        return html(templateRenderer.render(NOT_FOUND_TEMPLATE, values));
    }

    private ResponseEntity<String> html(String body) {
        return ResponseEntity.ok()
                .contentType(new MediaType(MediaType.TEXT_HTML, StandardCharsets.UTF_8))
                .body(body);
    }

    private static String normalise(String value) {
        return value == null ? "" : value.trim();
    }

    private static String orDefault(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
    }
}
