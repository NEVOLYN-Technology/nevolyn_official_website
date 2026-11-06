package com.nevolyn.officemanagement.experiment.dto;

import com.nevolyn.officemanagement.experiment.entity.Experiment;
import lombok.Builder;

import java.time.Instant;
import java.time.LocalDate;

/**
 * Data transfer record representing a research experiment log under a project.
 * Contains testing parameters, laboratory findings, researcher identity, and audit dates.
 */
@Builder
public record ExperimentDto(
        Long id,
        Long projectId,
        String title,
        LocalDate experimentDate,
        Long researcherId,
        String researcherName,
        String objective,
        String procedure,
        String result,
        String observation,
        String conclusion,
        String remarks,
        Instant createdAt
) {
    public static ExperimentDto fromEntity(Experiment e) {
        if (e == null) return null;
        return ExperimentDto.builder()
                .id(e.getId())
                .projectId(e.getProject() != null ? e.getProject().getId() : null)
                .title(e.getTitle())
                .experimentDate(e.getExperimentDate())
                .researcherId(e.getResearcher() != null ? e.getResearcher().getId() : null)
                .researcherName(e.getResearcher() != null ? e.getResearcher().getFullName() : null)
                .objective(e.getObjective())
                .procedure(e.getProcedure())
                .result(e.getResult())
                .observation(e.getObservation())
                .conclusion(e.getConclusion())
                .remarks(e.getRemarks())
                .createdAt(e.getCreatedAt())
                .build();
    }
}
