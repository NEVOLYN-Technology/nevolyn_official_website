package com.nevolyn.officemanagement.task.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

/**
 * Payload record for assigning a new task within an R&D project,
 * specifying assignee, deadlines, priority level, and requirements.
 */
public record CreateTaskRequest(
        Long projectId,

        @NotBlank(message = "Task title is required")
        @Size(max = 500)
        String title,

        String description,

        @NotNull(message = "Assignee is required")
        Long assignedToId,

        LocalDate startDate,
        LocalDate deadline,
        String priority
) {}
