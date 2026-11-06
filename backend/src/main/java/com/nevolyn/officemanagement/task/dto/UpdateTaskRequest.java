package com.nevolyn.officemanagement.task.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * Payload record for updating a task's progress percentage,
 * status lifecycle (TODO, IN_PROGRESS, REVIEW, DONE, BLOCKED), and review notes.
 */
public record UpdateTaskRequest(
        @NotBlank(message = "Status is required")
        String status,

        Integer progressPct,
        String remarks
) {}
