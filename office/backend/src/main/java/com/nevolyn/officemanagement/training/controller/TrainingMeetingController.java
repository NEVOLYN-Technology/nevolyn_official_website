package com.nevolyn.officemanagement.training.controller;

import com.nevolyn.officemanagement.common.util.IpUtils;
import com.nevolyn.officemanagement.training.dto.CreateTrainingMeetingRequest;
import com.nevolyn.officemanagement.training.dto.TrainingMeetingDto;
import com.nevolyn.officemanagement.training.service.TrainingMeetingService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

/**
 * Technical training session and organizational meeting controller.
 *
 * <p>Enables scheduling of technical workshops, syllabus tracking, conductor assignment,
 * and staff attendee management.
 */
@Tag(name = "Training & Meetings", description = "Technical training workshops, meeting agendas, and attendee rosters")
@RestController
@RequestMapping("/api/v1/training")
@RequiredArgsConstructor
public class TrainingMeetingController {

    private final TrainingMeetingService trainingMeetingService;

    /**
     * Retrieve all scheduled, ongoing, and historical technical training sessions.
     *
     * @return List of training meeting session DTOs with attendee counts.
     */
    @Operation(summary = "List training sessions", description = "Retrieve all upcoming and past training workshops and meetings.")
    @GetMapping
    public ResponseEntity<List<TrainingMeetingDto>> getAllSessions() {
        return ResponseEntity.ok(trainingMeetingService.getAllSessions());
    }

    /**
     * Schedule a new technical training session or organizational meeting.
     *
     * @param request        Validated creation payload with title, syllabus, scheduled date/time, and conductor.
     * @param servletRequest HTTP request used to resolve client IP for audit recording.
     * @param userDetails    Authenticated user principal scheduling the session.
     * @return Created session DTO with HTTP 201 Created status.
     */
    @Operation(summary = "Schedule training session", description = "Schedule a technical session with syllabus, date, and attendee roster.")
    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_admin') or hasRole('ADMIN')")
    public ResponseEntity<TrainingMeetingDto> createSession(
            @Valid @RequestBody CreateTrainingMeetingRequest request,
            HttpServletRequest servletRequest,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        String clientIp = IpUtils.extractClientIp(servletRequest);
        TrainingMeetingDto created = trainingMeetingService.createSession(request, userDetails.getUsername(), clientIp);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
}
