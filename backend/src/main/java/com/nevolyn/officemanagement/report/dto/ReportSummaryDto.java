package com.nevolyn.officemanagement.report.dto;

import lombok.Builder;

/**
 * Data transfer record providing high-level operational statistics and KPI counts
 * across employees, projects, task statuses, experiments, and training workshops.
 */
@Builder
public record ReportSummaryDto(
        long totalEmployees,
        long activeProjects,
        long totalTasks,
        long completedTasks,
        long totalExperiments,
        long totalTrainings
) {}
