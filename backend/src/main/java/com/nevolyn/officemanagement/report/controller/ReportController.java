package com.nevolyn.officemanagement.report.controller;

import com.nevolyn.officemanagement.report.dto.MonthlyAttendanceReportDto;
import com.nevolyn.officemanagement.report.dto.ReportSummaryDto;
import com.nevolyn.officemanagement.report.dto.RndReportDto;
import com.nevolyn.officemanagement.report.dto.TasksReportDto;
import com.nevolyn.officemanagement.report.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;


/**
 * Executive and administrative reporting analytics controller.
 *
 * <p>Provides aggregated performance, attendance, task velocity, and project portfolio metrics.
 * All reporting endpoints require {@code ROLE_ADMIN} authority.
 */
@RestController
@RequestMapping("/api/v1/reports")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ROLE_admin') or hasRole('ADMIN')")
public class ReportController {

    private final ReportService reportService;

    /**
     * Retrieve high-level organizational report summary across all key functional metrics.
     *
     * @return Summary DTO with aggregated attendance, tasks, and project statistics.
     */
    @GetMapping("/summary")
    public ResponseEntity<ReportSummaryDto> getSummary() {
        return ResponseEntity.ok(reportService.getSummary());
    }

    /**
     * Retrieve monthly attendance analytics and punctuality rates across all employees.
     *
     * <p>Applies elapsed-day business calculation to determine attendance and punctuality rates.
     *
     * @param month Optional target month in format 'YYYY-MM' (defaults to current month).
     * @return Monthly attendance report DTO with employee-level statistics.
     */
    @GetMapping("/attendance")
    public ResponseEntity<MonthlyAttendanceReportDto> getAttendanceReport(
            @RequestParam(required = false) String month
    ) {
        return ResponseEntity.ok(reportService.getMonthlyAttendanceReport(month));
    }

    /**
     * Retrieve task distribution and completion velocity report.
     *
     * @return Task metrics DTO with status distributions and priority breakdowns.
     */
    @GetMapping("/tasks")
    public ResponseEntity<TasksReportDto> getTasksReport() {
        return ResponseEntity.ok(reportService.getTasksReport());
    }

    /**
     * Retrieve project portfolio metrics including milestone progress and experiment counts.
     *
     * @return Project report DTO with budget and experiment summaries.
     */
    @GetMapping("/rnd")
    public ResponseEntity<RndReportDto> getRndReport() {
        return ResponseEntity.ok(reportService.getRndReport());
    }
}
