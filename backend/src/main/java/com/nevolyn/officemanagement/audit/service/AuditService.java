package com.nevolyn.officemanagement.audit.service;

import com.nevolyn.officemanagement.audit.entity.AuditLog;
import com.nevolyn.officemanagement.audit.repository.AuditLogRepository;
import com.nevolyn.officemanagement.user.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.Objects;

/**
 * Security and operational audit trail service.
 *
 * <p>Persists immutable event records to the {@code audit_logs} database table.
 * Audit logging runs with {@code Propagation.REQUIRES_NEW} to ensure audit trail
 * persistence is committed independently of the calling transaction.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    /**
     * Record an audit event into the permanent audit stream.
     *
     * @param action       Event classification code (e.g., 'LOGIN_SUCCESS', 'ATTENDANCE_CORRECTED').
     * @param username     Username of actor initiating the action.
     * @param user         Optional User entity reference if actor is an authenticated user.
     * @param ipAddress    Client IP address extracted from the HTTP request.
     * @param targetEntity Affected domain entity type (e.g., 'Attendance', 'Project').
     * @param targetId     Primary key of the affected entity.
     * @param details      Human-readable description or JSON payload summarizing the event.
     * @return Saved AuditLog entity, or null if persistence failed without throwing.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public AuditLog log(String action, String username, User user, String ipAddress, String targetEntity, Long targetId, String details) {
        try {
            AuditLog auditLog = AuditLog.builder()
                    .action(action)
                    .username(username != null ? username : (user != null ? user.getUsername() : "ANONYMOUS"))
                    .user(user)
                    .ipAddress(ipAddress)
                    .targetEntity(targetEntity)
                    .targetId(targetId)
                    .details(details)
                    .build();
            return auditLogRepository.save(Objects.requireNonNull(auditLog));
        } catch (Exception e) {
            log.error("Failed to write audit log action='{}' for user='{}': {}", action, username, e.getMessage());
            return null;
        }
    }

    /**
     * Retrieve paginated audit logs with optional filtering by action or user query.
     *
     * @param action   Optional exact action name filter.
     * @param query    Optional search substring matching usernames.
     * @param pageable Pagination and sorting criteria.
     * @return Paginated page of AuditLog entities ordered descending by creation timestamp.
     */
    public Page<AuditLog> getAuditLogs(String action, String query, Pageable pageable) {
        if (action != null && !action.isBlank()) {
            return auditLogRepository.findByActionOrderByCreatedAtDesc(action, pageable);
        }
        if (query != null && !query.isBlank()) {
            return auditLogRepository.findByUsernameContainingIgnoreCaseOrderByCreatedAtDesc(query, pageable);
        }
        return auditLogRepository.findAllByOrderByCreatedAtDesc(pageable);
    }
}
