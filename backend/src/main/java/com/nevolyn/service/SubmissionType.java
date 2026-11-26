package com.nevolyn.service;

/**
 * Kinds of public submission the platform accepts.
 *
 * <p>Each constant carries everything that varies per kind - its human label,
 * public reference-code prefix and web template names - so adding a new kind
 * never requires touching controller or service branching.
 */
public enum SubmissionType {

    CONTACT_INQUIRY("Contact Inquiry", "INQ", "contact"),
    JOB_APPLICATION("Job Application", "APP", "application");

    private final String label;
    private final String referencePrefix;
    private final String templatePrefix;

    SubmissionType(String label, String referencePrefix, String templatePrefix) {
        this.label = label;
        this.referencePrefix = referencePrefix;
        this.templatePrefix = templatePrefix;
    }

    /** Human-readable label, e.g. {@code Job Application}. */
    public String label() {
        return label;
    }

    /** Prefix of public reference codes, e.g. {@code APP} in {@code APP-2026-K7F3Q9XD}. */
    public String referencePrefix() {
        return referencePrefix;
    }

    /** Classpath path of the email template used for the given mail kind. */
    public String emailTemplate(MailKind kind) {
        return "templates/email/" + templatePrefix + "-" + kind.templateSuffix() + ".html";
    }

    /** Classpath path of this type's pre-flight confirmation view. */
    public String confirmTemplate() {
        return "templates/web/" + templatePrefix + "-acknowledge-confirm.html";
    }

    /** Classpath path of this type's acknowledgement result view. */
    public String resultTemplate() {
        return "templates/web/" + templatePrefix + "-acknowledge-result.html";
    }

    /** The three transactional emails sent for every submission. */
    public enum MailKind {
        ADMIN_NOTIFICATION("admin-notification-mail"),
        RECEIPT("sender-confirmation-mail"),
        ACKNOWLEDGEMENT("acknowledgement-email");

        private final String templateSuffix;

        MailKind(String templateSuffix) {
            this.templateSuffix = templateSuffix;
        }

        String templateSuffix() {
            return templateSuffix;
        }
    }
}
