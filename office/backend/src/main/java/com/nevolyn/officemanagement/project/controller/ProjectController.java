package com.nevolyn.officemanagement.project.controller;

import com.nevolyn.officemanagement.common.util.IpUtils;
import com.nevolyn.officemanagement.project.dto.CreateProjectRequest;
import com.nevolyn.officemanagement.project.dto.ProjectDetailDto;
import com.nevolyn.officemanagement.project.dto.ProjectDto;
import com.nevolyn.officemanagement.project.dto.UpdateProjectStatusRequest;
import com.nevolyn.officemanagement.project.service.ProjectService;
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
 * Project portfolio management controller.
 *
 * <p>Provides endpoints for:
 * <ul>
 *   <li>Listing active and historical initiatives</li>
 *   <li>Retrieving project details with nested experiments and technical development records</li>
 *   <li>Creating new projects with unique project codes (e.g., {@code PRJ-001})</li>
 *   <li>Transitioning project lifecycle statuses and updating progress percentages (0–100)</li>
 * </ul>
 */
@Tag(name = "Projects", description = "Project portfolio lifecycle, milestones, and status management")
@RestController
@RequestMapping("/api/v1/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;

    /**
     * Retrieve all projects in the organizational portfolio.
     *
     * @return List of high-level project DTOs.
     */
    @Operation(summary = "List all projects", description = "Query the full project portfolio with progress and status.")
    @GetMapping
    public ResponseEntity<List<ProjectDto>> getAllProjects() {
        return ResponseEntity.ok(projectService.getAllProjects());
    }

    /**
     * Retrieve a single project summary by its unique database ID.
     *
     * @param id Project database primary key.
     * @return Project DTO representation.
     */
    @Operation(summary = "Get project by ID", description = "Retrieve project metadata, status, and lead employee.")
    @GetMapping("/{id}")
    public ResponseEntity<ProjectDto> getProjectById(@PathVariable Long id) {
        return ResponseEntity.ok(projectService.getProjectById(id));
    }

    /**
     * Retrieve full hierarchical project details including nested experiments and development records.
     *
     * @param id Project database primary key.
     * @return Comprehensive project detail DTO with experiment protocols and technical logs.
     */
    @Operation(summary = "Get project detailed view", description = "Retrieve project with all attached experiments and development logs.")
    @GetMapping("/{id}/detail")
    public ResponseEntity<ProjectDetailDto> getProjectDetail(@PathVariable Long id) {
        return ResponseEntity.ok(projectService.getProjectDetail(id));
    }

    /**
     * Create a new project in the portfolio.
     *
     * @param request        Validated project creation payload with unique code, name, and lead user ID.
     * @param servletRequest HTTP request used to resolve client IP for audit logging.
     * @param admin          Authenticated administrator user principal.
     * @return Created project DTO with HTTP 201 Created status.
     */
    @Operation(summary = "Create project", description = "Create a new project with a unique uppercase code.")
    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_admin') or hasRole('ADMIN')")
    public ResponseEntity<ProjectDto> createProject(
            @Valid @RequestBody CreateProjectRequest request,
            HttpServletRequest servletRequest,
            @AuthenticationPrincipal UserDetails admin
    ) {
        String clientIp = IpUtils.extractClientIp(servletRequest);
        ProjectDto created = projectService.createProject(request, admin.getUsername(), clientIp);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * Update the operational lifecycle status and completion progress percentage of a project.
     *
     * @param id             Project primary key to update.
     * @param request        Validated status update payload (status enum, progress 0-100, optional notes).
     * @param servletRequest HTTP request used to capture client IP for audit trail.
     * @param admin          Authenticated administrator user principal.
     * @return Updated project DTO.
     */
    @Operation(summary = "Update project status", description = "Update project lifecycle status, notes, and progress percentage.")
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAuthority('ROLE_admin') or hasRole('ADMIN')")
    public ResponseEntity<ProjectDto> updateProjectStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateProjectStatusRequest request,
            HttpServletRequest servletRequest,
            @AuthenticationPrincipal UserDetails admin
    ) {
        String clientIp = IpUtils.extractClientIp(servletRequest);
        return ResponseEntity.ok(projectService.updateProjectStatus(id, request, admin.getUsername(), clientIp));
    }
}
