package com.nevolyn.officemanagement.report.dto;

import lombok.Builder;

import java.math.BigDecimal;
import java.util.List;

/**
 * Data transfer record presenting monthly attendance aggregation per employee,
 * including present days, tardiness, absence count, and cumulative billed hours.
 */
@Builder
public record MonthlyAttendanceReportDto(
        String month,
        int elapsedDays,
        List<EmployeeAttendanceSummary> employees
) {
    @Builder
    public record EmployeeAttendanceSummary(
            Long userId,
            String employeeId,
            String fullName,
            String designation,
            long presentDays,
            long lateDays,
            long absentDays,
            BigDecimal totalHours
    ) {}
}
