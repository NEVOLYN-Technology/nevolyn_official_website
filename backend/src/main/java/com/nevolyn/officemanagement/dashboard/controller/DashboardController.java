package com.nevolyn.officemanagement.dashboard.controller;

import com.nevolyn.officemanagement.dashboard.dto.AdminDashboardDto;
import com.nevolyn.officemanagement.dashboard.dto.EmployeeDashboardDto;
import com.nevolyn.officemanagement.dashboard.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

// Executive and staff operational dashboard controller.
// Serves role-tailored KPI aggregations for administrators and individual employees.
@RestController
@RequestMapping("/api/v1/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    // Retrieve executive dashboard statistics across all organizational domains.
    @GetMapping("/admin")
    @PreAuthorize("hasAuthority('ROLE_admin') or hasRole('ADMIN')")
    public ResponseEntity<AdminDashboardDto> getAdminDashboard() {
        return ResponseEntity.ok(dashboardService.getAdminDashboard());
    }

    // Retrieve personal dashboard overview for the authenticated employee.
    @GetMapping("/employee")
    public ResponseEntity<EmployeeDashboardDto> getEmployeeDashboard(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(dashboardService.getEmployeeDashboard(userDetails.getUsername()));
    }

    // Retrieve personal dashboard overview for a specific employee.
    // Super Admin can view any user; Admin can view employees.
    @GetMapping("/employee/{targetUsername}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<EmployeeDashboardDto> getEmployeeDashboardForUser(
            @PathVariable String targetUsername,
            @AuthenticationPrincipal UserDetails caller
    ) {
        return ResponseEntity.ok(dashboardService.getEmployeeDashboardForCaller(targetUsername, caller.getUsername()));
    }
}
