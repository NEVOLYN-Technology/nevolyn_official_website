package com.nevolyn.officemanagement.dashboard.controller;

import com.nevolyn.officemanagement.dashboard.dto.AdminDashboardDto;
import com.nevolyn.officemanagement.dashboard.dto.EmployeeDashboardDto;
import com.nevolyn.officemanagement.dashboard.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

/**
 * Executive and staff operational dashboard controller.
 *
 * <p>Serves role-tailored KPI aggregations:
 * <ul>
 *   <li>Administrative view: Organization-wide staff count, today's attendance metrics, active projects, and system health</li>
 *   <li>Employee view: Individual attendance status, assigned pending tasks, and recent activity metrics</li>
 * </ul>
 */
@Tag(name = "Dashboard", description = "Role-specific operational KPI dashboards and summaries")
@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    /**
     * Retrieve executive dashboard statistics across all organizational domains.
     *
     * @return Aggregated administrative dashboard metrics including 8 primary KPI cards and live rosters.
     */
    @Operation(summary = "Get admin dashboard", description = "Retrieve global KPI metrics, attendance counts, and active projects.")
    @GetMapping("/admin")
    @PreAuthorize("hasAuthority('ROLE_admin') or hasRole('ADMIN')")
    public ResponseEntity<AdminDashboardDto> getAdminDashboard() {
        return ResponseEntity.ok(dashboardService.getAdminDashboard());
    }

    /**
     * Retrieve personal dashboard overview for the authenticated employee.
     *
     * @param userDetails Authenticated user principal.
     * @return Personalized employee dashboard metrics including today's punch and assigned tasks.
     */
    @Operation(summary = "Get employee dashboard", description = "Retrieve personal attendance status, assigned tasks, and daily stats.")
    @GetMapping("/employee")
    public ResponseEntity<EmployeeDashboardDto> getEmployeeDashboard(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(dashboardService.getEmployeeDashboard(userDetails.getUsername()));
    }
}
