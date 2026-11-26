package com.nevolyn.officemanagement.training.dto;

import com.nevolyn.officemanagement.training.entity.TrainingMeeting;
import lombok.Builder;

import java.time.Instant;
import java.time.LocalDate;

/**
 * Data transfer record describing an archived or upcoming training seminar or technical meeting.
 * Includes presenter details, attendee roll, duration minutes, and documented outcomes.
 */
@Builder
public record TrainingMeetingDto(
        Long id,
        String title,
        String type,
        LocalDate sessionDate,
        String trainerPresenter,
        String participants,
        Integer durationMinutes,
        String notes,
        String outcome,
        String remarks,
        Long createdById,
        String createdByName,
        Instant createdAt
) {
    public static TrainingMeetingDto fromEntity(TrainingMeeting s) {
        if (s == null) return null;
        return TrainingMeetingDto.builder()
                .id(s.getId())
                .title(s.getTitle())
                .type(s.getType() != null ? s.getType().getDisplayName() : null)
                .sessionDate(s.getSessionDate())
                .trainerPresenter(s.getTrainerPresenter())
                .participants(s.getParticipants())
                .durationMinutes(s.getDurationMinutes())
                .notes(s.getNotes())
                .outcome(s.getOutcome())
                .remarks(s.getRemarks())
                .createdById(s.getCreatedBy() != null ? s.getCreatedBy().getId() : null)
                .createdByName(s.getCreatedBy() != null ? s.getCreatedBy().getFullName() : null)
                .createdAt(s.getCreatedAt())
                .build();
    }
}
