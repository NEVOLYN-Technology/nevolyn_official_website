package com.nevolyn.officemanagement.training.service;

import com.nevolyn.officemanagement.audit.service.AuditService;
import com.nevolyn.officemanagement.common.exception.ResourceNotFoundException;
import com.nevolyn.officemanagement.training.dto.CreateTrainingMeetingRequest;
import com.nevolyn.officemanagement.training.dto.TrainingMeetingDto;
import com.nevolyn.officemanagement.training.entity.TrainingMeeting;
import com.nevolyn.officemanagement.training.repository.TrainingMeetingRepository;
import com.nevolyn.officemanagement.user.entity.User;
import com.nevolyn.officemanagement.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service managing organizational training sessions, technical workshops, and team meetings.
 *
 * <p>Tracks scheduled dates, presenters, attendee rosters, durations, outcomes,
 * and compliance audit logs.</p>
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class TrainingMeetingService {

    private final TrainingMeetingRepository trainingMeetingRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;

    /**
     * Retrieves all recorded training and meeting sessions in reverse chronological order.
     *
     * @return list of {@link TrainingMeetingDto} objects
     */
    @Transactional(readOnly = true)
    public List<TrainingMeetingDto> getAllSessions() {
        return trainingMeetingRepository.findAllByOrderBySessionDateDesc().stream()
                .map(TrainingMeetingDto::fromEntity)
                .toList();
    }

    /**
     * Schedules and logs a new organizational training session or meeting.
     *
     * @param request session creation payload containing title, type, presenter, and minutes
     * @param username username of the organizer/creator
     * @param clientIp remote client IP for audit recording
     * @return the created {@link TrainingMeetingDto}
     * @throws ResourceNotFoundException if the creating user cannot be identified
     */
    @Transactional
    public TrainingMeetingDto createSession(CreateTrainingMeetingRequest request, String username, String clientIp) {
        User creator = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        TrainingMeeting.SessionType type = TrainingMeeting.SessionType.MEETING;
        try {
            type = TrainingMeeting.SessionType.valueOf(request.type().toUpperCase().replace(" ", "_"));
        } catch (IllegalArgumentException ignored) {}

        TrainingMeeting session = TrainingMeeting.builder()
                .title(request.title().trim())
                .type(type)
                .sessionDate(request.sessionDate())
                .trainerPresenter(request.trainerPresenter())
                .participants(request.participants())
                .durationMinutes(request.durationMinutes() != null ? request.durationMinutes() : 60)
                .notes(request.notes())
                .outcome(request.outcome())
                .remarks(request.remarks())
                .createdBy(creator)
                .build();

        TrainingMeeting saved = trainingMeetingRepository.save(session);

        auditService.log(
                "CREATE_TRAINING_MEETING",
                username,
                creator,
                clientIp,
                "trainings_meetings",
                saved.getId(),
                "Created session: " + saved.getTitle() + " (" + saved.getType() + ")"
        );

        return TrainingMeetingDto.fromEntity(saved);
    }
}
