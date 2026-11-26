package com.nevolyn.officemanagement.worklog.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Payload record for submitting a daily operational work log,
 * including date, task summary, hours spent, encountered impediments, and next actions.
 */
public record CreateWorkLogRequest(
        LocalDate logDate,

        @NotBlank(message = "Work completed summary is required")
        String workCompleted,

        @PositiveOrZero(message = "Hours spent must be positive or zero")
        BigDecimal timeSpentHours,

        String issues,
        String nextAction,
        String remarks
) {}
