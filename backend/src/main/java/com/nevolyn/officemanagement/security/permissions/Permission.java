package com.nevolyn.officemanagement.security.permissions;

/**
 * Granular permission constants for method-level security.
 *
 * <p>Used with {@code @PreAuthorize("hasAuthority('permission:action')")}
 * to enforce fine-grained access control beyond simple role checks.
 *
 * <p>Permission format: {@code domain:action}
 */
public final class Permission {

    private Permission() {}

    // ── Attendance ──────────────────────────────────────────────
    /** Employee can check in (only from authorized network). */
    public static final String ATTENDANCE_CHECK_IN  = "attendance:check_in";
    /** Employee can check out. */
    public static final String ATTENDANCE_CHECK_OUT = "attendance:check_out";
    /** Admin can view all attendance records. */
    public static final String ATTENDANCE_VIEW_ALL  = "attendance:view_all";
    /** Admin can correct/edit attendance records. */
    public static final String ATTENDANCE_CORRECT   = "attendance:correct";

    // ── Users / Employees ───────────────────────────────────────
    public static final String USER_CREATE         = "user:create";
    public static final String USER_EDIT           = "user:edit";
    public static final String USER_TOGGLE_STATUS  = "user:toggle_status";
    public static final String USER_RESET_PASSWORD = "user:reset_password";
    public static final String USER_VIEW_ALL       = "user:view_all";

    // ── R&D Projects ────────────────────────────────────────────
    public static final String PROJECT_CREATE      = "project:create";
    public static final String PROJECT_EDIT        = "project:edit";
    public static final String PROJECT_DELETE      = "project:delete";
    public static final String PROJECT_VIEW        = "project:view";
    public static final String PROJECT_UPDATE_STATUS = "project:update_status";

    // ── Experiments ─────────────────────────────────────────────
    public static final String EXPERIMENT_CREATE   = "experiment:create";
    public static final String EXPERIMENT_VIEW     = "experiment:view";

    // ── Development Records ─────────────────────────────────────
    public static final String DEVELOPMENT_CREATE  = "development:create";
    public static final String DEVELOPMENT_VIEW    = "development:view";

    // ── Tasks ────────────────────────────────────────────────────
    public static final String TASK_CREATE         = "task:create";
    public static final String TASK_VIEW_ALL       = "task:view_all";
    public static final String TASK_VIEW_ASSIGNED  = "task:view_assigned";
    public static final String TASK_UPDATE         = "task:update";
    public static final String TASK_DELETE         = "task:delete";

    // ── Work Logs ────────────────────────────────────────────────
    public static final String WORKLOG_CREATE      = "worklog:create";
    public static final String WORKLOG_VIEW_ALL    = "worklog:view_all";
    public static final String WORKLOG_VIEW_OWN    = "worklog:view_own";

    // ── Training / Meetings ─────────────────────────────────────
    public static final String TRAINING_CREATE     = "training:create";
    public static final String TRAINING_VIEW       = "training:view";

    // ── Reports ──────────────────────────────────────────────────
    public static final String REPORT_VIEW         = "report:view";

    // ── Files ────────────────────────────────────────────────────
    public static final String FILE_UPLOAD         = "file:upload";
    public static final String FILE_DOWNLOAD       = "file:download";

    // ── Audit ────────────────────────────────────────────────────
    public static final String AUDIT_VIEW          = "audit:view";

    // ── QR Code ──────────────────────────────────────────────────
    public static final String QR_VIEW             = "qr:view";
}
