package com.nevolyn.officemanagement.worklog.repository;

import com.nevolyn.officemanagement.worklog.entity.WorkLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Spring Data JPA repository for {@link WorkLog} entities.
 *
 * <p>Provides indexed user-based log lookups, daily idempotent retrieval,
 * and paginated work journal streams.</p>
 */
@Repository
public interface WorkLogRepository extends JpaRepository<WorkLog, Long> {

    /**
     * Retrieves all work logs for a specific user ordered by log date and submission timestamp descending.
     *
     * @param userId the primary key ID of the authoring employee
     * @return chronologically ordered list of work logs
     */
    List<WorkLog> findByUserIdOrderByLogDateDescSubmittedAtDesc(Long userId);

    /**
     * Retrieves the 5 most recent work logs for a specific user.
     *
     * @param userId the primary key ID of the user
     * @return top 5 latest work logs
     */
    List<WorkLog> findTop5ByUserIdOrderByLogDateDescSubmittedAtDesc(Long userId);

    /**
     * Retrieves a paginated slice of all work logs across the company ordered by date and submission time.
     *
     * @param pageable pagination parameters
     * @return page of work logs
     */
    Page<WorkLog> findAllByOrderByLogDateDescSubmittedAtDesc(Pageable pageable);

    /**
     * Finds a single work log submitted by a user on a given date (for upsert idempotence).
     *
     * @param userId the primary key ID of the user
     * @param logDate calendar date of the entry
     * @return an {@link Optional} containing the work log if previously submitted
     */
    Optional<WorkLog> findByUserIdAndLogDate(Long userId, LocalDate logDate);
}

