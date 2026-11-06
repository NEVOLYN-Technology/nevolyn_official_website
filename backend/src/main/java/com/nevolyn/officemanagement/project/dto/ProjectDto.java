package com.nevolyn.officemanagement.project.dto;

import com.nevolyn.officemanagement.project.entity.RndProject;
import lombok.Builder;

import java.time.Instant;
import java.time.LocalDate;

/**
 * Data transfer object representing an R&D project.
 *
 * <p>Exposes high-level metadata, responsible lead identity, milestones,
 * percentage progress, and lifecycle status.</p>
 */
@Builder
public record ProjectDto(
        Long id,
        String code,
        String name,
        String objective,
        String description,
        Long responsibleId,
        String responsibleName,
        LocalDate startDate,
        LocalDate targetDate,
        String status,
        Integer progressPct,
        String remarks,
        Instant createdAt
) {
    public static ProjectDto fromEntity(RndProject p) {
        if (p == null) return null;
        return ProjectDto.builder()
                .id(p.getId())
                .code(p.getCode())
                .name(p.getName())
                .objective(p.getObjective())
                .description(p.getDescription())
                .responsibleId(p.getResponsible() != null ? p.getResponsible().getId() : null)
                .responsibleName(p.getResponsible() != null ? p.getResponsible().getFullName() : null)
                .startDate(p.getStartDate())
                .targetDate(p.getTargetDate())
                .status(p.getStatus() != null ? p.getStatus().name() : null)
                .progressPct(p.getProgressPct())
                .remarks(p.getRemarks())
                .createdAt(p.getCreatedAt())
                .build();
    }
}
