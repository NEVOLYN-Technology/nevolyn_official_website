package com.nevolyn.officemanagement.attendance.controller;

import com.nevolyn.officemanagement.attendance.dto.AttendanceResponse;
import com.nevolyn.officemanagement.attendance.entity.Attendance;
import com.nevolyn.officemanagement.attendance.service.AttendanceService;
import com.nevolyn.officemanagement.common.response.ApiResponse;
import com.nevolyn.officemanagement.common.util.IpUtils;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

/**
 * Attendance REST controller — extremely thin, all logic in {@link AttendanceService}.
 *
 * <p>Endpoint summary:
 * <pre>
 * POST /api/v1/attendance/check-in     → Employee check-in
 * POST /api/v1/attendance/check-out    → Employee check-out
 * GET  /api/v1/attendance/today        → Employee's own today status
 * GET  /api/v1/attendance/history      → Employee's full history
 * GET  /api/v1/attendance?date=YYYY-MM-DD → Admin: all records for a date
 * </pre>
 */
@RestController
@RequestMapping("/api/v1/attendance")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceService attendanceService;

    @PostMapping("/check-in")
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<AttendanceResponse>> checkIn(
            @AuthenticationPrincipal UserDetails userDetails,
            HttpServletRequest request
    ) {
        Attendance attendance = attendanceService.checkIn(
                userDetails.getUsername(),
                IpUtils.extractClientIp(request),
                request.getHeader("User-Agent")
        );
        return ResponseEntity.ok(ApiResponse.success("Check-in recorded", AttendanceResponse.from(attendance)));
    }

    @PostMapping("/check-out")
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<AttendanceResponse>> checkOut(
            @AuthenticationPrincipal UserDetails userDetails,
            HttpServletRequest request
    ) {
        Attendance attendance = attendanceService.checkOut(
                userDetails.getUsername(),
                IpUtils.extractClientIp(request)
        );
        return ResponseEntity.ok(ApiResponse.success("Check-out recorded", AttendanceResponse.from(attendance)));
    }

    @GetMapping("/today")
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<AttendanceResponse>> getToday(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return attendanceService.getTodayAttendance(userDetails.getUsername())
                .map(a -> ResponseEntity.ok(ApiResponse.success(AttendanceResponse.from(a))))
                .orElseGet(() -> ResponseEntity.ok(ApiResponse.success("No attendance record yet today", null)));
    }

    @GetMapping("/history")
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<List<AttendanceResponse>>> getHistory(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        List<AttendanceResponse> history = attendanceService.getHistory(userDetails.getUsername())
                .stream().map(AttendanceResponse::from).toList();
        return ResponseEntity.ok(ApiResponse.success(history));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<List<AttendanceResponse>>> getByDate(
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        LocalDate queryDate = (date != null) ? date : LocalDate.now();
        List<AttendanceResponse> records = attendanceService.getByDate(queryDate)
                .stream().map(AttendanceResponse::from).toList();
        return ResponseEntity.ok(ApiResponse.success(records));
    }
}
