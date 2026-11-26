package com.nevolyn.officemanagement.training.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.time.LocalDate;

/**
 * Payload record for scheduling or recording a corporate training session,
 * seminar, technical workshop, or coordination meeting.
 */
public record CreateTrainingMeetingRequest(
        @NotBlank(message = "Session title is required")
        String title,

        @NotBlank(message = "Session type is required")
        String type,

        @NotNull(message = "Session date is required")
        LocalDate sessionDate,

        String trainerPresenter,
        String participants,

        @Positive(message = "Duration must be positive")
        Integer durationMinutes,

        String notes,
        String outcome,
        String remarks
) {}
