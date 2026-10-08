package com.nevolyn.service;

import com.nevolyn.model.ContactInquiry;
import com.nevolyn.model.JobApplication;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Immutable, entity-agnostic snapshot of a stored submission.
 *
 * <p>
 * This is the single shape every downstream component works with - emails,
 * acknowledgement pages, lookups - so none of them depend on the JPA entities
 * and the entity-to-view mapping lives in exactly one place.
 *
 * <p>
 * Instances are safe to hand to {@code @Async} code: they hold plain values
 * only, never lazy entity state.
 *
 * @param type           which kind of submission this is
 * @param referenceCode  public tracking code, e.g. {@code INQ-2026-K7F3Q9XD}
 * @param name           submitter display name
 * @param email          submitter email address
 * @param subject        inquiry subject; a neutral label for applications
 * @param message        inquiry message, or the applicant's statement of
 *                       purpose
 * @param phone          phone number, or {@code null} when not collected
 * @param address        postal address, or {@code null} when not collected
 * @param links          newline-joined professional links, or {@code null}
 * @param resumePath     stored CV path on disk, or {@code null} for inquiries
 * @param resumeFileName original CV file name, or {@code null} for inquiries
 * @param submittedAt    creation time in UTC, or {@code null} if not yet
 *                       persisted
 * @param acknowledged   whether staff have already acknowledged the submission
 * @param linkedin       candidate LinkedIn profile, or {@code null}
 * @param github         candidate GitHub profile, or {@code null}
 * @param website        candidate personal website / portfolio, or {@code null}
 */
public record SubmissionDetails(
        SubmissionType type,
        String referenceCode,
        String name,
        String email,
        String subject,
        String message,
        String phone,
        String address,
        String nid,
        String links,
        String resumePath,
        String resumeFileName,
        LocalDateTime submittedAt,
        boolean acknowledged,
        String linkedin,
        String github,
        String website) {

    public SubmissionDetails(
            SubmissionType type,
            String referenceCode,
            String name,
            String email,
            String subject,
            String message,
            String phone,
            String address,
            String links,
            String resumePath,
            String resumeFileName,
            LocalDateTime submittedAt,
            boolean acknowledged) {
        this(type, referenceCode, name, email, subject, message, phone, address, null, links, resumePath, resumeFileName,
                submittedAt, acknowledged, null, null, null);
    }

    private static final String DEFAULT_INQUIRY_SUBJECT = "General Inquiry";
    private static final String APPLICATION_SUBJECT = "Job Application Submission";

    public static SubmissionDetails from(ContactInquiry inquiry) {
        return new SubmissionDetails(
                SubmissionType.CONTACT_INQUIRY,
                inquiry.getInquiryId(),
                inquiry.getName(),
                inquiry.getEmail(),
                inquiry.getSubject() != null ? inquiry.getSubject() : DEFAULT_INQUIRY_SUBJECT,
                inquiry.getMessage(),
                null, null, null, null, null,
                inquiry.getCreatedAt(),
                inquiry.getAcknowledgedAt() != null);
    }

    public static SubmissionDetails from(JobApplication application) {
        String effectiveAttachmentPath = application.getDossierPath() != null
                ? application.getDossierPath()
                : application.getResumePath();
        String effectiveAttachmentName = application.getDossierPath() != null
                ? ("NEVOLYN_Application_" + application.getApplicationId() + ".pdf")
                : application.getOriginalFileName();

        return new SubmissionDetails(
                SubmissionType.JOB_APPLICATION,
                application.getApplicationId(),
                application.getName(),
                application.getEmail(),
                APPLICATION_SUBJECT,
                application.getReason(),
                application.getPhone(),
                application.getAddress(),
                application.getNid(),
                joinLinks(application),
                effectiveAttachmentPath,
                effectiveAttachmentName,
                application.getCreatedAt(),
                Boolean.TRUE.equals(application.getIsAcknowledged()) || application.getAcknowledgedAt() != null,
                application.getLinkedin(),
                application.getGithub(),
                application.getWebsite());
    }

    private static String joinLinks(JobApplication application) {
        List<String> lines = new ArrayList<>(3);
        addLink(lines, "LinkedIn", application.getLinkedin());
        addLink(lines, "GitHub", application.getGithub());
        addLink(lines, "Portfolio", application.getWebsite());
        return lines.isEmpty() ? null : String.join("\n", lines);
    }

    private static void addLink(List<String> lines, String label, String url) {
        if (url != null && !url.isBlank()) {
            lines.add(label + ": " + url);
        }
    }
}
