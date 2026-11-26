package com.nevolyn.officemanagement.development.controller;

import com.nevolyn.officemanagement.common.util.IpUtils;
import com.nevolyn.officemanagement.development.dto.CreateDevelopmentRecordRequest;
import com.nevolyn.officemanagement.development.dto.DevelopmentRecordDto;
import com.nevolyn.officemanagement.development.service.DevelopmentRecordService;
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
 * Technical development record and software engineering changelog controller.
 *
 * <p>Enables developers to document code modifications, architecture milestones,
 * SemVer increments, technical challenges, and solutions nested within a project.
 */
@RestController
@RequestMapping("/api/v1/projects/{projectId}/development-records")
@RequiredArgsConstructor
public class DevelopmentRecordController {

    private final DevelopmentRecordService developmentRecordService;

    /**
     * Retrieve all technical development logs associated with a specific project.
     *
     * @param projectId Parent project database primary key.
     * @return List of development record DTOs.
     */
    @GetMapping
    public ResponseEntity<List<DevelopmentRecordDto>> getRecords(@PathVariable Long projectId) {
        return ResponseEntity.ok(developmentRecordService.getRecordsByProject(projectId));
    }

    /**
     * Record a new technical development milestone or changelog entry under a project.
     *
     * @param projectId      Parent project database primary key.
     * @param request        Validated creation payload with title, SemVer version, challenge, and resolution.
     * @param servletRequest HTTP request used to resolve client IP for audit recording.
     * @param user           Authenticated user principal authoring the log.
     * @return Created development record DTO with HTTP 201 Created status.
     */
    @PostMapping
    public ResponseEntity<DevelopmentRecordDto> createRecord(
            @PathVariable Long projectId,
            @Valid @RequestBody CreateDevelopmentRecordRequest request,
            HttpServletRequest servletRequest,
            @AuthenticationPrincipal UserDetails user
    ) {
        String clientIp = IpUtils.extractClientIp(servletRequest);
        DevelopmentRecordDto created = developmentRecordService.createRecord(projectId, request, user.getUsername(), clientIp);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
}
