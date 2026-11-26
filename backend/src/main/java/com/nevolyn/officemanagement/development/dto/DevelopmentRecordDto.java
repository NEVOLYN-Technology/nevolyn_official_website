package com.nevolyn.officemanagement.development.dto;

import com.nevolyn.officemanagement.development.entity.DevelopmentRecord;
import lombok.Builder;

import java.time.Instant;
import java.time.LocalDate;

/**
 * Data transfer record representing a project's development log and stage progression.
 * Encapsulates responsible engineer metadata, validation results, and version markers.
 */
@Builder
public record DevelopmentRecordDto(
        Long id,
        Long projectId,
        String productName,
        String stage,
        String version,
        LocalDate recordDate,
        Long responsibleId,
        String responsibleName,
        String result,
        String issues,
        String nextAction,
        Instant createdAt
) {
    public static DevelopmentRecordDto fromEntity(DevelopmentRecord r) {
        if (r == null) return null;
        return DevelopmentRecordDto.builder()
                .id(r.getId())
                .projectId(r.getProject() != null ? r.getProject().getId() : null)
                .productName(r.getProductName())
                .stage(r.getStage())
                .version(r.getVersion())
                .recordDate(r.getRecordDate())
                .responsibleId(r.getResponsible() != null ? r.getResponsible().getId() : null)
                .responsibleName(r.getResponsible() != null ? r.getResponsible().getFullName() : null)
                .result(r.getResult())
                .issues(r.getIssues())
                .nextAction(r.getNextAction())
                .createdAt(r.getCreatedAt())
                .build();
    }
}
