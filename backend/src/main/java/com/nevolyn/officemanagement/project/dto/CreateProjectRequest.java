package com.nevolyn.officemanagement.project.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

/**
 * Payload record for registering an R&D project, specifying project code,
 * title, objectives, project lead (responsibleId), and lifecycle timelines.
 */
public record CreateProjectRequest(
        @NotBlank(message = "Project code is required")
        @Size(max = 50)
        String code,

        @NotBlank(message = "Project name is required")
        @Size(max = 255)
        String name,

        String objective,
        String description,
        Long responsibleId,
        LocalDate startDate,
        LocalDate targetDate,
        String status,
        String remarks
) {}
