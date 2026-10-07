package com.nevolyn.service;

import com.nevolyn.repository.ContactInquiryRepository;
import com.nevolyn.repository.JobApplicationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.Locale;
import java.util.Optional;

/**
 * Cross-type read and acknowledge operations over stored submissions.
 *
 * <p>Reference codes carry a type prefix ({@code APP-...}, {@code INQ-...}), so the
 * likelier repository is queried first; the other is still consulted so
 * legacy or hand-typed codes keep working.
 */
@Service
@RequiredArgsConstructor
public class SubmissionService {

    private final ContactInquiryRepository inquiryRepository;
    private final JobApplicationRepository applicationRepository;

    /**
     * @param referenceCode tracking code supplied by the caller; may be blank
     * @return the submission, or empty when the code is blank or unknown
     */
    @Transactional(readOnly = true)
    public Optional<SubmissionDetails> findByReference(String referenceCode) {
        if (referenceCode == null || referenceCode.isBlank()) {
            return Optional.empty();
        }
        String code = referenceCode.trim();

        boolean looksLikeApplication = code.toUpperCase(Locale.ROOT)
                .startsWith(SubmissionType.JOB_APPLICATION.referencePrefix());
        return looksLikeApplication
                ? findApplication(code).or(() -> findInquiry(code))
                : findInquiry(code).or(() -> findApplication(code));
    }

    /**
     * Atomically marks a submission acknowledged.
     *
     * <p>Implemented as a conditional {@code UPDATE ... WHERE acknowledged_at IS NULL},
     * so when several requests race (double click, retrying scanner, multiple
     * app instances) exactly one observes {@code true}.
     *
     * @return {@code true} only for the caller that performed the first acknowledgement
     */
    @Transactional
    public boolean markAcknowledged(SubmissionDetails submission) {
        LocalDateTime now = LocalDateTime.now(ZoneOffset.UTC);
        int updated = switch (submission.type()) {
            case CONTACT_INQUIRY -> inquiryRepository.markAcknowledged(submission.referenceCode(), now);
            case JOB_APPLICATION -> applicationRepository.markAcknowledged(submission.referenceCode(), now);
        };
        return updated == 1;
    }

    private Optional<SubmissionDetails> findApplication(String code) {
        return applicationRepository.findByApplicationId(code).map(SubmissionDetails::from);
    }

    private Optional<SubmissionDetails> findInquiry(String code) {
        return inquiryRepository.findByInquiryId(code).map(SubmissionDetails::from);
    }
}
