package com.nevolyn.officemanagement.audit.repository;

import com.nevolyn.officemanagement.audit.entity.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA data access repository for immutable {@link AuditLog} entities.
 */
@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    /**
     * Find audit log entries matching a specific action code, sorted by newest first.
     *
     * @param action   Action classification code.
     * @param pageable Pagination criteria.
     * @return Paginated audit logs.
     */
    Page<AuditLog> findByActionOrderByCreatedAtDesc(String action, Pageable pageable);

    /**
     * Find audit log entries matching a username substring (case-insensitive), sorted by newest first.
     *
     * @param username Search query matching usernames.
     * @param pageable Pagination criteria.
     * @return Paginated audit logs.
     */
    Page<AuditLog> findByUsernameContainingIgnoreCaseOrderByCreatedAtDesc(String username, Pageable pageable);

    /**
     * Retrieve all audit log entries sorted by newest first.
     *
     * @param pageable Pagination criteria.
     * @return Paginated audit logs.
     */
    Page<AuditLog> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
