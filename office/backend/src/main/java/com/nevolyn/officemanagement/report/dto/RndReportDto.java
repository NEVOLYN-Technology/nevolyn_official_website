package com.nevolyn.officemanagement.report.dto;

import lombok.Builder;

import java.util.List;

/**
 * Data transfer record providing R&D project portfolio audit summaries,
 * progress metrics, experiment counts, dev record counts, and document tallies.
 */
@Builder
public record RndReportDto(
        long totalProjects,
        List<ProjectRndSummary> projects
) {
    @Builder
    public record ProjectRndSummary(
            Long projectId,
            String code,
            String name,
            String status,
            Integer progressPct,
            String responsibleName,
            long tasksCount,
            long completedTasksCount,
            long experimentsCount,
            long developmentRecordsCount,
            long filesCount
    ) {}
}
