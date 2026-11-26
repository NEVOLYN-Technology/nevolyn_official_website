package com.nevolyn.officemanagement.experiment.controller;

import com.nevolyn.officemanagement.common.util.IpUtils;
import com.nevolyn.officemanagement.experiment.dto.CreateExperimentRequest;
import com.nevolyn.officemanagement.experiment.dto.ExperimentDto;
import com.nevolyn.officemanagement.experiment.service.ExperimentService;
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
 * Project experiment protocol and lab findings controller.
 *
 * <p>Enables researchers to document hypotheses, experimental methodologies,
 * quantitative results, and conclusions nested within a parent project.
 */
@RestController
@RequestMapping("/api/v1/projects/{projectId}/experiments")
@RequiredArgsConstructor
public class ExperimentController {

    private final ExperimentService experimentService;

    /**
     * Retrieve all experiment protocols associated with a specific project.
     *
     * @param projectId Parent project database primary key.
     * @return List of experiment DTOs.
     */
    @GetMapping
    public ResponseEntity<List<ExperimentDto>> getExperiments(@PathVariable Long projectId) {
        return ResponseEntity.ok(experimentService.getExperimentsByProject(projectId));
    }

    /**
     * Record a new experiment protocol under a project.
     *
     * @param projectId      Parent project database primary key.
     * @param request        Validated creation payload with title, hypothesis, methodology, and results.
     * @param servletRequest HTTP request used to resolve client IP for audit recording.
     * @param user           Authenticated user principal conducting the experiment.
     * @return Created experiment DTO with HTTP 201 Created status.
     */
    @PostMapping
    public ResponseEntity<ExperimentDto> createExperiment(
            @PathVariable Long projectId,
            @Valid @RequestBody CreateExperimentRequest request,
            HttpServletRequest servletRequest,
            @AuthenticationPrincipal UserDetails user
    ) {
        String clientIp = IpUtils.extractClientIp(servletRequest);
        ExperimentDto created = experimentService.createExperiment(projectId, request, user.getUsername(), clientIp);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
}
