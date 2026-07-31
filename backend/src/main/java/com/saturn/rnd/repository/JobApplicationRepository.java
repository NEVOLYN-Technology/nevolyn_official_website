package com.saturn.rnd.repository;

import com.saturn.rnd.model.JobApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Data access for {@link JobApplication} rows.
 *
 * <p>
 * Spring Data generates the implementation from each method name at startup, so
 * there is no implementation class to maintain. {@link JpaRepository} supplies
 * {@code save}, {@code findById}, {@code findAll}, {@code count} and
 * {@code delete} on top of the finders below.
 *
 * <p>
 * Rows here reference an uploaded CV via {@code resumePath}. That path points at
 * the container filesystem, which is ephemeral on Render's free tier — the row
 * can outlive the file it names. Never assume the file is still present; check
 * before reading, as {@code EmailService} does.
 *
 * @author Saturn R&D Engineering
 * @version 0.2.0
 */
@Repository
public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {

    /**
     * Looks an application up by its public reference code, e.g.
     * {@code APP-2026-0042}.
     *
     * <h2>What it is for</h2>
     * {@code applicationId} is the only identifier the candidate ever sees — it
     * appears in the acknowledgement email and on the verification screen, and
     * it is also the prefix of the stored CV filename. The numeric primary key
     * is internal. Use this whenever a human quotes a reference.
     *
     * <h2>How to use it</h2>
     * <pre>{@code
     * // HR lookup: "Did APP-2026-0042 ever complete verification?"
     * JobApplication application = repository.findByApplicationId(reference)
     *         .orElseThrow(() -> new ResourceNotFoundException(
     *                 "No application found for reference " + reference));
     *
     * if (Boolean.TRUE.equals(application.getIsVerified())) {
     *     Path cv = Path.of(application.getResumePath()); // may no longer exist
     * }
     * }</pre>
     *
     * <p>
     * The column is {@code UNIQUE}, so at most one row can ever match.
     *
     * <p>
     * No caller in the current codebase — this is the intended entry point for
     * an HR or status-tracking endpoint. Authenticate any endpoint built on it:
     * this returns the candidate's full application including email, phone,
     * address and CV path.
     *
     * @param applicationId public reference code, e.g. {@code APP-2026-0042}
     * @return the matching application, or empty if no row carries that code
     */
    Optional<JobApplication> findByApplicationId(String applicationId);

    /**
     * Finds the application awaiting confirmation for a verification token.
     *
     * <h2>What it is for</h2>
     * Step 2 of the email pipeline. When a candidate opens the link in the
     * verification email, {@code ApplicationService.verifyApplication} calls this
     * to resolve the token, marks the application verified, and only then emails
     * the R&D team with the CV attached. Until that happens the application goes
     * no further.
     *
     * <h2>How to use it</h2>
     * <pre>{@code
     * JobApplication application = repository.findByVerificationToken(token)
     *         .orElseThrow(() -> new ResourceNotFoundException(
     *                 "Invalid or expired verification token: " + token));
     * }</pre>
     *
     * <p>
     * An empty result means the token is unknown, already consumed, or
     * fabricated. Treat all three identically so the response cannot be used to
     * probe which tokens exist.
     *
     * @param verificationToken single-use token from the verification email
     * @return the matching application, or empty if no row holds that token
     */
    Optional<JobApplication> findByVerificationToken(String verificationToken);
}
