package com.nevolyn.officemanagement.report.dto;

import lombok.Builder;

import java.util.List;
import java.util.Map;

/**
 * Data transfer record presenting task distribution metrics across statuses,
 * priority levels, and individual employee workload breakdowns.
 */
@Builder
public record TasksReportDto(
        long totalTasks,
        Map<String, Long> countByStatus,
        Map<String, Long> countByPriority,
        List<EmployeeTaskSummary> employeeBreakdown
) {
    @Builder
    public record EmployeeTaskSummary(
            Long userId,
            String employeeId,
            String fullName,
            long totalAssigned,
            long completed,
            long inProgress,
            long pending
    ) {}
}
