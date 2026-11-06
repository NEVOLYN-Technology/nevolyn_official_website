package com.nevolyn.officemanagement.attendance.controller;

import com.nevolyn.officemanagement.attendance.dto.AdminAttendanceRecordDto;
import com.nevolyn.officemanagement.attendance.dto.AttendanceCorrectionRequest;
import com.nevolyn.officemanagement.attendance.dto.AttendanceResponse;
import com.nevolyn.officemanagement.attendance.entity.Attendance;
import com.nevolyn.officemanagement.attendance.service.AttendanceService;
import com.nevolyn.officemanagement.common.util.IpUtils;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;


/**
 * Administrative attendance management and kiosk configuration controller.
 *
 * <p>Provides privileged administrative endpoints for:
 * <ul>
 *   <li>Querying organization-wide daily attendance rosters across all active employees</li>
 *   <li>Performing audited manual attendance corrections with mandatory justification</li>
 *   <li>Generating localized network metadata for wall-mount QR check-in kiosk terminals</li>
 * </ul>
 *
 * <p>All endpoints within this controller require {@code ROLE_ADMIN} authority.
 */
@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ROLE_admin') or hasRole('ADMIN')")
public class AdminAttendanceController {

    private final AttendanceService attendanceService;

    @Value("${server.port:8080}")
    private String serverPort;

    /**
     * Retrieve the organization-wide attendance roster for a specific calendar date.
     *
     * <p>Performs an outer join against all active employees, presenting complete attendance
     * records including check-in/out timestamps, hours worked, and punctuality flags, or empty
     * records indicating absence.
     *
     * @param date Optional target date in ISO format (YYYY-MM-DD); defaults to current server date if omitted.
     * @return List of employee daily attendance records with punctuality status.
     */
    @GetMapping("/attendance")
    public ResponseEntity<List<AdminAttendanceRecordDto>> getAttendanceByDate(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        LocalDate queryDate = date != null ? date : LocalDate.now();
        return ResponseEntity.ok(attendanceService.getAdminDailyAttendance(queryDate));
    }

    /**
     * Perform an audited administrative correction on an employee's attendance record.
     *
     * <p>Updates check-in and/or check-out timestamps, automatically recalculates worked hours,
     * re-evaluates punctuality status, and records an immutable entry in the audit trail.
     *
     * @param request        Validated correction payload containing user ID, target date, times, and mandatory reason.
     * @param servletRequest Incoming HTTP request used to resolve the administrator's client IP.
     * @param admin          Authenticated administrator user principal performing the modification.
     * @return Updated attendance response representation.
     */
    @PostMapping("/attendance/correct")
    public ResponseEntity<AttendanceResponse> correctAttendance(
            @Valid @RequestBody AttendanceCorrectionRequest request,
            HttpServletRequest servletRequest,
            @AuthenticationPrincipal UserDetails admin
    ) {
        String clientIp = IpUtils.extractClientIp(servletRequest);
        Attendance corrected = attendanceService.correctAttendance(request, admin.getUsername(), clientIp);
        return ResponseEntity.ok(AttendanceResponse.from(corrected));
    }

    /**
     * Retrieve server network identity and localized QR code target URL for wall-mount kiosk display.
     *
     * @param servletRequest Incoming HTTP request used to determine the local network interface IP.
     * @return Map containing server IP, port, and fully qualified attendance URL.
     */
    @GetMapping("/qr-info")
    public ResponseEntity<Map<String, String>> getQrInfo(HttpServletRequest servletRequest) {
        String localIp = servletRequest.getLocalAddr();
        String qrUrl = "http://" + (localIp != null && !localIp.isBlank() ? localIp : "127.0.0.1") + ":" + serverPort + "/attendance";
        return ResponseEntity.ok(Map.of(
                "serverIp", localIp != null ? localIp : "127.0.0.1",
                "serverPort", serverPort,
                "attendanceUrl", qrUrl
        ));
    }
}
