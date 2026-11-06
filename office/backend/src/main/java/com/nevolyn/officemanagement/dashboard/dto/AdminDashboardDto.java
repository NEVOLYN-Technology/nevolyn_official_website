package com.nevolyn.officemanagement.dashboard.dto;

import com.nevolyn.officemanagement.attendance.dto.AdminAttendanceRecordDto;
import com.nevolyn.officemanagement.audit.dto.AuditLogDto;
import lombok.Builder;

import java.util.List;

/**
 * Composite data transfer record aggregating executive dashboard metrics:
 * headcount, daily attendance numbers, project health, pending tasks, and recent audit logs.
 */
@Builder
public record AdminDashboardDto(
        long totalEmployees,
        long presentToday,
        long lateToday,
        long currentlyInside,
        long absentToday,
        long activeProjects,
        long pendingTasks,
        long completedTasks,
        List<AdminAttendanceRecordDto> todayAttendance,
        List<AuditLogDto> recentAuditLogs
) {}
