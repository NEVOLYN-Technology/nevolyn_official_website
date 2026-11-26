package com.nevolyn.officemanagement.worklog.controller;

import com.nevolyn.officemanagement.common.util.IpUtils;
import com.nevolyn.officemanagement.worklog.dto.CreateWorkLogRequest;
import com.nevolyn.officemanagement.worklog.dto.WorkLogDto;
import com.nevolyn.officemanagement.worklog.service.WorkLogService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;


/**
 * Daily employee work journal and activity tracking controller.
 *
 * <p>Enables employees to log daily achievements, hours spent, and blocker notes;
 * provides supervisory oversight for project and time management.
 */
@RestController
@RequestMapping("/api/v1/work-logs")
@RequiredArgsConstructor
public class WorkLogController {

    private final WorkLogService workLogService;

    /**
     * Retrieve daily work logs visible to the authenticated user.
     *
     * <p>Administrators see organization-wide activity streams; staff see personal submissions.
     *
     * @param userDetails Authenticated user principal.
     * @return List of work log DTOs.
     */
    @GetMapping
    public ResponseEntity<List<WorkLogDto>> getWorkLogs(@AuthenticationPrincipal UserDetails userDetails) {
        boolean isAdmin = userDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_admin") || a.getAuthority().equals("ROLE_ADMIN"));
        return ResponseEntity.ok(workLogService.getWorkLogs(userDetails.getUsername(), isAdmin));
    }

    /**
     * Record a new daily activity work log entry.
     *
     * @param request        Validated work log creation payload (date, category, hours, tasks done, blockers).
     * @param servletRequest HTTP request used to capture client IP for audit trail.
     * @param userDetails    Authenticated user principal submitting the log.
     * @return Created work log DTO with HTTP 201 Created status.
     */
    @PostMapping
    public ResponseEntity<WorkLogDto> createWorkLog(
            @Valid @RequestBody CreateWorkLogRequest request,
            HttpServletRequest servletRequest,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        String clientIp = IpUtils.extractClientIp(servletRequest);
        WorkLogDto created = workLogService.createWorkLog(request, userDetails.getUsername(), clientIp);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
}
