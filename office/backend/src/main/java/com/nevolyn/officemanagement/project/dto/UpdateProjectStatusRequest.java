package com.nevolyn.officemanagement.project.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * Payload record for mutating an R&D project's status lifecycle,
 * progress percentage, and administrative completion notes.
 */
public record UpdateProjectStatusRequest(
        @NotBlank(message = "Status is required")
        String status,

        Integer progressPct,
        String remarks
) {}
