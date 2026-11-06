package com.nevolyn.officemanagement.task.dto;

import com.nevolyn.officemanagement.task.entity.Task;
import lombok.Builder;

import java.time.Instant;
import java.time.LocalDate;

/**
 * Data transfer object representing an assigned task.
 *
 * <p>Encapsulates task scope, parent project info, assignee profile details,
 * priority, deadlines, and execution progress.</p>
 */
@Builder
public record TaskDto(
        Long id,
        Long projectId,
        String projectCode,
        String projectName,
        String title,
        String description,
        Long assignedToId,
        String assignedToName,
        String assignedToEmployeeId,
        LocalDate startDate,
        LocalDate deadline,
        String priority,
        String status,
        Integer progressPct,
        String remarks,
        Long createdById,
        String createdByName,
        Instant createdAt
) {
    public static TaskDto fromEntity(Task t) {
        if (t == null) return null;
        return TaskDto.builder()
                .id(t.getId())
                .projectId(t.getProject() != null ? t.getProject().getId() : null)
                .projectCode(t.getProject() != null ? t.getProject().getCode() : null)
                .projectName(t.getProject() != null ? t.getProject().getName() : null)
                .title(t.getTitle())
                .description(t.getDescription())
                .assignedToId(t.getAssignedTo() != null ? t.getAssignedTo().getId() : null)
                .assignedToName(t.getAssignedTo() != null ? t.getAssignedTo().getFullName() : null)
                .assignedToEmployeeId(t.getAssignedTo() != null ? t.getAssignedTo().getEmployeeId() : null)
                .startDate(t.getStartDate())
                .deadline(t.getDeadline())
                .priority(t.getPriority() != null ? t.getPriority().name() : null)
                .status(t.getStatus() != null ? t.getStatus().name() : null)
                .progressPct(t.getProgressPct())
                .remarks(t.getRemarks())
                .createdById(t.getCreatedBy() != null ? t.getCreatedBy().getId() : null)
                .createdByName(t.getCreatedBy() != null ? t.getCreatedBy().getFullName() : null)
                .createdAt(t.getCreatedAt())
                .build();
    }
}
