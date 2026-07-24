package com.saturn.rnd.controller;

import com.saturn.rnd.dto.ApiResponse;
import com.saturn.rnd.dto.TeamMemberDto;
import com.saturn.rnd.service.TeamService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller providing dynamic R&D engineering staff records.
 *
 * <p>
 * <strong>Endpoint:</strong> {@code GET /api/v1/team/members}
 * </p>
 * <p>
 * <strong>Access Control:</strong> Public
 * </p>
 *
 * <h2>Usage Scenarios</h2>
 * <ul>
 * <li>Allows frontend to fetch active staff dynamically from database.</li>
 * <li>Supports optional query filtering by department (e.g.
 * {@code ?department=Industrial%20AI}).</li>
 * </ul>
 *
 * @author Saturn R&D Engineering
 * @version 0.1.0
 * @see TeamService
 * @see TeamMemberDto
 */
@RestController
@RequestMapping("/api/v1/team/members")
@RequiredArgsConstructor
public class TeamController {

    private final TeamService teamService;

    /**
     * Fetches active R&D team members ordered by display sequence.
     *
     * @param department Optional department query filter
     * @return {@link ResponseEntity} containing standardized {@link ApiResponse}
     *         wrapping list of {@link TeamMemberDto}
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<TeamMemberDto>>> getTeamMembers(
            @RequestParam(value = "department", required = false) String department) {
        log.info("Received GET /api/v1/team/members with department filter='{}'", department);

        List<TeamMemberDto> members = teamService.getTeamMembers(department);

        log.debug("Fetched {} active team members", members.size());

        ApiResponse<List<TeamMemberDto>> envelope = ApiResponse.success(
                HttpStatus.OK.value(),
                "Active team members fetched successfully.",
                members);

        return ResponseEntity.ok(envelope);
    }
}
