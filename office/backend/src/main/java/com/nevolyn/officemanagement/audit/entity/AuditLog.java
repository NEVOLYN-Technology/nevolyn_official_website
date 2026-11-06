package com.nevolyn.officemanagement.audit.entity;

import com.nevolyn.officemanagement.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

/**
 * Immutable audit log entry.
 *
 * <p>Maps to the {@code audit_logs} table (V10 migration).
 * Records are never updated or deleted — insert-only.
 */
@Entity
@Table(name = "audit_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(length = 100)
    private String username;

    @Column(nullable = false, length = 100)
    private String action;

    @Column(columnDefinition = "TEXT")
    private String details;

    @Column(name = "ip_address", length = 45)
    private String ipAddress;

    @Column(name = "target_entity", length = 100)
    private String targetEntity;

    @Column(name = "target_id")
    private Long targetId;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();

    // ── Common action constants ─────────────────────────────────
    public static final String ACTION_LOGIN             = "LOGIN";
    public static final String ACTION_LOGOUT            = "LOGOUT";
    public static final String ACTION_LOGIN_FAILED      = "LOGIN_FAILED";
    public static final String ACTION_CHECK_IN          = "CHECK_IN";
    public static final String ACTION_CHECK_OUT         = "CHECK_OUT";
    public static final String ACTION_ATTENDANCE_CORRECT = "ATTENDANCE_CORRECT";
    public static final String ACTION_CREATE_EMPLOYEE   = "CREATE_EMPLOYEE";
    public static final String ACTION_EDIT_EMPLOYEE     = "EDIT_EMPLOYEE";
    public static final String ACTION_TOGGLE_EMPLOYEE   = "TOGGLE_EMPLOYEE";
    public static final String ACTION_RESET_PASSWORD    = "RESET_PASSWORD";
    public static final String ACTION_CREATE_PROJECT    = "CREATE_PROJECT";
    public static final String ACTION_EDIT_PROJECT      = "EDIT_PROJECT";
    public static final String ACTION_CREATE_TASK       = "CREATE_TASK";
    public static final String ACTION_UPDATE_TASK       = "UPDATE_TASK";
    public static final String ACTION_FILE_UPLOAD       = "FILE_UPLOAD";
    public static final String ACTION_FILE_DOWNLOAD     = "FILE_DOWNLOAD";
}
