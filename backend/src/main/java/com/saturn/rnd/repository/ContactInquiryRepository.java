package com.saturn.rnd.repository;

import com.saturn.rnd.model.ContactInquiry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Data access for {@link ContactInquiry} rows.
 *
 * <p>
 * Spring Data generates the implementation from each method name at startup —
 * {@code findByVerificationToken} becomes
 * {@code SELECT ... WHERE verification_token = ?}. There is no implementation
 * class to write or maintain. {@link JpaRepository} additionally supplies
 * {@code save}, {@code findById}, {@code findAll}, {@code count} and
 * {@code delete}.
 *
 * <p>
 * Both finders return {@link Optional} rather than {@code null}, so a missing
 * row is a value the caller must handle rather than an NPE waiting to happen.
 * The established pattern in this codebase is to convert it to a 404:
 *
 * <pre>{@code
 * ContactInquiry inquiry = repository.findByVerificationToken(token)
 *         .orElseThrow(() -> new ResourceNotFoundException(
 *                 "Invalid or expired verification token: " + token));
 * }</pre>
 *
 * @author Saturn R&D Engineering
 * @version 0.2.0
 */
@Repository
public interface ContactInquiryRepository extends JpaRepository<ContactInquiry, Long> {

    /**
     * Looks an inquiry up by its public reference code, e.g.
     * {@code INQ-2026-0042}.
     *
     * <h2>What it is for</h2>
     * {@code inquiryId} is the only identifier a visitor ever sees — it appears
     * in the acknowledgement email and on the verification screen. The numeric
     * primary key is internal and is never exposed. So whenever a human quotes a
     * reference, this is the method that resolves it.
     *
     * <h2>How to use it</h2>
     * <pre>{@code
     * // Support lookup: "I submitted INQ-2026-0042 and heard nothing."
     * ContactInquiry inquiry = repository.findByInquiryId(reference)
     *         .orElseThrow(() -> new ResourceNotFoundException(
     *                 "No inquiry found for reference " + reference));
     *
     * if (!inquiry.getIsVerified()) {
     *     // Never reached the R&D team — the visitor never clicked the link.
     * }
     * }</pre>
     *
     * <p>
     * The column is {@code UNIQUE}, so at most one row can ever match.
     *
     * <p>
     * No caller in the current codebase — this is the intended entry point for a
     * status-tracking or admin endpoint. Authenticate any endpoint built on it:
     * reference codes are guessable, and this returns the full submission
     * including the sender's email address and message body.
     *
     * @param inquiryId public reference code, e.g. {@code INQ-2026-0042}
     * @return the matching inquiry, or empty if no row carries that code
     */
    Optional<ContactInquiry> findByInquiryId(String inquiryId);

    /**
     * Finds the inquiry awaiting confirmation for a verification token.
     *
     * <h2>What it is for</h2>
     * Step 2 of the email pipeline. When a visitor opens the link in the
     * verification email, {@code ContactService.verifyInquiry} calls this to
     * resolve the token back to the pending submission, marks it verified, and
     * only then notifies the R&D team.
     *
     * <h2>How to use it</h2>
     * <pre>{@code
     * ContactInquiry inquiry = repository.findByVerificationToken(token)
     *         .orElseThrow(() -> new ResourceNotFoundException(
     *                 "Invalid or expired verification token: " + token));
     * }</pre>
     *
     * <p>
     * An empty result means the token is unknown, already consumed, or
     * fabricated. Treat all three identically — returning distinct messages
     * would tell an attacker which tokens exist.
     *
     * @param verificationToken single-use token from the verification email
     * @return the matching inquiry, or empty if no row holds that token
     */
    Optional<ContactInquiry> findByVerificationToken(String verificationToken);
}
