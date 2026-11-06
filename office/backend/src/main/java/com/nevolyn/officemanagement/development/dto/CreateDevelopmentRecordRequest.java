package com.nevolyn.officemanagement.development.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

/**
 * Payload record for registering a new engineering or R&D development milestone
 * within a project, including product details, phase stage, issues, and next actions.
 */
public record CreateDevelopmentRecordRequest(
        @NotBlank(message = "Product name is required")
        @Size(max = 255)
        String productName,

        @NotBlank(message = "Stage is required")
        @Size(max = 100)
        String stage,

        String version,
        LocalDate recordDate,
        Long responsibleId,
        String result,
        String issues,
        String nextAction
) {}
