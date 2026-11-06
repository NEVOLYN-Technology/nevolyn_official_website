package com.nevolyn.officemanagement.audit.controller;

import com.nevolyn.officemanagement.audit.dto.AuditLogDto;
import com.nevolyn.officemanagement.audit.service.AuditService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

/**
 * System security and operational audit log stream controller.
 *
 * <p>Exposes paginated, filterable immutable event records detailing:
 * <ul>
 *   <li>Authentication events (login successes, logouts, failures)</li>
 *   <li>Administrative overrides (attendance corrections, password resets)</li>
 *   <li>Entity mutations (projects, tasks, user state toggles)</li>
 * </ul>
 *
 * <p>Access is strictly restricted to users with {@code ROLE_ADMIN} authority.
 */
@Tag(name = "Audit Trail", description = "Immutable system security and data modification audit stream")
@RestController
@RequestMapping("/api/v1/audit")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ROLE_admin') or hasRole('ADMIN')")
public class AuditController {

    private final AuditService auditService;

    /**
     * Retrieve paginated system audit logs with optional action and text filtering.
     *
     * @param action   Optional action filter (e.g., 'LOGIN', 'ATTENDANCE_CORRECTED').
     * @param query    Optional search query matching details, target entity, or IP.
     * @param pageable Pagination and sorting criteria (defaults to 50 items per page).
     * @return Paginated stream of audit log DTOs.
     */
    @Operation(summary = "Query audit trail", description = "Retrieve paginated, filterable system audit logs.")
    @GetMapping
    public ResponseEntity<Page<AuditLogDto>> getAuditLogs(
            @RequestParam(required = false) String action,
            @RequestParam(required = false) String query,
            @PageableDefault(size = 50) Pageable pageable
    ) {
        Page<AuditLogDto> page = auditService.getAuditLogs(action, query, pageable)
                .map(AuditLogDto::fromEntity);
        return ResponseEntity.ok(page);
    }
}
