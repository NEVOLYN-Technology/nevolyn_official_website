package com.nevolyn.officemanagement.attendance.service;

import com.nevolyn.officemanagement.attendance.entity.Attendance;
import com.nevolyn.officemanagement.attendance.policy.AttendancePolicy;
import com.nevolyn.officemanagement.attendance.repository.AttendanceRepository;
import com.nevolyn.officemanagement.audit.entity.AuditLog;
import com.nevolyn.officemanagement.audit.repository.AuditLogRepository;
import com.nevolyn.officemanagement.common.exception.BusinessRuleException;
import com.nevolyn.officemanagement.common.exception.ResourceNotFoundException;
import com.nevolyn.officemanagement.user.entity.User;
import com.nevolyn.officemanagement.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

/**
 * Attendance business logic.
 *
 * <p>All punctuality decisions are delegated to {@link AttendancePolicy}.
 * The controller stays completely thin.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final UserRepository userRepository;
    private final AttendancePolicy attendancePolicy;
    private final AuditLogRepository auditLogRepository;

    /**
     * Record a check-in for an employee.
     *
     * <p>Guards:
     * <ul>
     *   <li>Admin cannot check in</li>
     *   <li>Cannot check in twice on the same day</li>
     * </ul>
     */
    @Transactional
    public Attendance checkIn(String username, String clientIp, String userAgent) {
        User user = getUserByUsername(username);

        // Admin exclusion (mirrors Flask admin attendance exclusion)
        if (!attendancePolicy.isEligibleForAttendance(user)) {
            throw new BusinessRuleException("Administrators are not eligible for attendance check-in.");
        }

        LocalDate today = LocalDate.now();
        LocalTime now = LocalTime.now();

        // Check for existing record
        Optional<Attendance> existing = attendanceRepository.findByUserIdAndDate(user.getId(), today);
        if (existing.isPresent() && existing.get().getCheckInTime() != null) {
            throw new BusinessRuleException("You have already checked in today.");
        }

        Attendance.LateStatus lateStatus = attendancePolicy.determineLateStatus(now);

        Attendance attendance;
        if (existing.isPresent()) {
            // Update existing absent record
            attendance = existing.get();
            attendance.setCheckInTime(now);
            attendance.setLateStatus(lateStatus);
            attendance.setStatus(Attendance.AttendanceStatus.PRESENT);
            attendance.setIpAddress(clientIp);
            attendance.setUserAgent(userAgent);
        } else {
            // Create new record
            attendance = Attendance.builder()
                    .user(user)
                    .date(today)
                    .checkInTime(now)
                    .lateStatus(lateStatus)
                    .status(Attendance.AttendanceStatus.PRESENT)
                    .ipAddress(clientIp)
                    .userAgent(userAgent)
                    .build();
        }

        attendance = attendanceRepository.save(attendance);

        auditLogRepository.save(AuditLog.builder()
                .user(user)
                .username(username)
                .action(AuditLog.ACTION_CHECK_IN)
                .details("Checked in at " + now + " — " + lateStatus.getDisplayName())
                .ipAddress(clientIp)
                .targetEntity("attendance")
                .targetId(attendance.getId())
                .build());

        log.info("User '{}' checked in at {} — {}", username, now, lateStatus);
        return attendance;
    }

    /**
     * Record a check-out for an employee.
     *
     * <p>Guards:
     * <ul>
     *   <li>Must have checked in first</li>
     *   <li>Cannot check out twice</li>
     * </ul>
     */
    @Transactional
    public Attendance checkOut(String username, String clientIp) {
        User user = getUserByUsername(username);

        if (!attendancePolicy.isEligibleForAttendance(user)) {
            throw new BusinessRuleException("Administrators are not eligible for attendance check-out.");
        }

        LocalDate today = LocalDate.now();
        LocalTime now = LocalTime.now();

        Attendance attendance = attendanceRepository.findByUserIdAndDate(user.getId(), today)
                .orElseThrow(() -> new BusinessRuleException("You have not checked in today."));

        if (attendance.getCheckInTime() == null) {
            throw new BusinessRuleException("You have not checked in today.");
        }
        if (attendance.getCheckOutTime() != null) {
            throw new BusinessRuleException("You have already checked out today.");
        }

        Attendance.EarlyCheckout earlyCheckout = attendancePolicy.determineEarlyCheckout(now);
        double totalHours = attendancePolicy.calculateTotalHours(attendance.getCheckInTime(), now);

        attendance.setCheckOutTime(now);
        attendance.setEarlyCheckout(earlyCheckout);
        attendance.setTotalHours(BigDecimal.valueOf(totalHours).setScale(2, RoundingMode.HALF_UP));
        attendance = attendanceRepository.save(attendance);

        auditLogRepository.save(AuditLog.builder()
                .user(user)
                .username(username)
                .action(AuditLog.ACTION_CHECK_OUT)
                .details("Checked out at " + now + " — total: " + totalHours + "h — " + earlyCheckout.getDisplayName())
                .ipAddress(clientIp)
                .targetEntity("attendance")
                .targetId(attendance.getId())
                .build());

        log.info("User '{}' checked out at {} — {}h — {}", username, now, totalHours, earlyCheckout);
        return attendance;
    }

    /**
     * Get today's attendance record for the current user.
     */
    @Transactional(readOnly = true)
    public Optional<Attendance> getTodayAttendance(String username) {
        User user = getUserByUsername(username);
        return attendanceRepository.findByUserIdAndDate(user.getId(), LocalDate.now());
    }

    /**
     * Get attendance history for a user (personal history page).
     */
    @Transactional(readOnly = true)
    public List<Attendance> getHistory(String username) {
        User user = getUserByUsername(username);
        return attendanceRepository.findByUserIdOrderByDateDesc(user.getId());
    }

    /**
     * Admin: get all attendance records for a specific date.
     */
    @Transactional(readOnly = true)
    public List<Attendance> getByDate(LocalDate date) {
        return attendanceRepository.findAllByDateWithUser(date);
    }

    /**
     * Admin: get full employee roster with presence/absence for a given date (matching legacy outer join).
     */
    @Transactional(readOnly = true)
    public List<com.nevolyn.officemanagement.attendance.dto.AdminAttendanceRecordDto> getAdminDailyAttendance(LocalDate date) {
        List<User> employees = userRepository.findByIsActiveTrueOrderByFullNameAsc();
        List<Attendance> records = attendanceRepository.findAllByDateWithUser(date);
        java.util.Map<Long, Attendance> attendanceByUser = records.stream()
                .collect(java.util.stream.Collectors.toMap(a -> a.getUser().getId(), a -> a, (k1, k2) -> k1));

        return employees.stream().map(emp -> {
            Attendance a = attendanceByUser.get(emp.getId());
            if (a != null) {
                return com.nevolyn.officemanagement.attendance.dto.AdminAttendanceRecordDto.builder()
                        .id(a.getId())
                        .userId(emp.getId())
                        .employeeId(emp.getEmployeeId())
                        .fullName(emp.getFullName())
                        .designation(emp.getDesignation())
                        .date(date)
                        .checkInTime(a.getCheckInTime())
                        .checkOutTime(a.getCheckOutTime())
                        .totalHours(a.getTotalHours())
                        .status(a.getStatus() != null ? a.getStatus().name() : "Present")
                        .lateStatus(a.getLateStatus() != null ? a.getLateStatus().getDisplayName() : "On Time")
                        .earlyCheckout(a.getEarlyCheckout() != null ? a.getEarlyCheckout().getDisplayName() : "No")
                        .notes(a.getNotes())
                        .build();
            } else {
                return com.nevolyn.officemanagement.attendance.dto.AdminAttendanceRecordDto.builder()
                        .id(null)
                        .userId(emp.getId())
                        .employeeId(emp.getEmployeeId())
                        .fullName(emp.getFullName())
                        .designation(emp.getDesignation())
                        .date(date)
                        .checkInTime(null)
                        .checkOutTime(null)
                        .totalHours(BigDecimal.ZERO)
                        .status("Absent")
                        .lateStatus("-")
                        .earlyCheckout("-")
                        .notes(null)
                        .build();
            }
        }).toList();
    }

    /**
     * Admin: manually correct an attendance record with mandatory reason.
     */
    @Transactional
    public Attendance correctAttendance(com.nevolyn.officemanagement.attendance.dto.AttendanceCorrectionRequest request, String adminUsername, String clientIp) {
        if (request.reason() == null || request.reason().isBlank()) {
            throw new BusinessRuleException("A non-empty correction reason is strictly required.");
        }

        User user = userRepository.findById(request.userId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", request.userId()));

        if (!attendancePolicy.isEligibleForAttendance(user)) {
            throw new BusinessRuleException("Attendance cannot be recorded for administrators.");
        }

        Attendance attendance = attendanceRepository.findByUserIdAndDate(user.getId(), request.date())
                .orElseGet(() -> Attendance.builder()
                        .user(user)
                        .date(request.date())
                        .build());

        attendance.setCheckInTime(request.checkInTime());
        attendance.setCheckOutTime(request.checkOutTime());

        if (request.checkInTime() != null) {
            attendance.setLateStatus(attendancePolicy.determineLateStatus(request.checkInTime()));
        } else {
            attendance.setLateStatus(Attendance.LateStatus.ON_TIME);
        }

        if (request.checkOutTime() != null) {
            attendance.setEarlyCheckout(attendancePolicy.determineEarlyCheckout(request.checkOutTime()));
        } else {
            attendance.setEarlyCheckout(Attendance.EarlyCheckout.NO);
        }

        if (request.checkInTime() != null && request.checkOutTime() != null) {
            double hours = attendancePolicy.calculateTotalHours(request.checkInTime(), request.checkOutTime());
            attendance.setTotalHours(BigDecimal.valueOf(hours).setScale(2, RoundingMode.HALF_UP));
        } else {
            attendance.setTotalHours(BigDecimal.ZERO);
        }

        if (request.status() != null && !request.status().isBlank()) {
            try {
                attendance.setStatus(Attendance.AttendanceStatus.valueOf(request.status().toUpperCase()));
            } catch (IllegalArgumentException e) {
                attendance.setStatus(Attendance.AttendanceStatus.PRESENT);
            }
        } else {
            attendance.setStatus(request.checkInTime() != null ? Attendance.AttendanceStatus.PRESENT : Attendance.AttendanceStatus.ABSENT);
        }

        attendance.setNotes("Corrected by " + adminUsername + ": " + request.reason());
        Attendance saved = attendanceRepository.save(attendance);

        auditLogRepository.save(AuditLog.builder()
                .username(adminUsername)
                .action(AuditLog.ACTION_ATTENDANCE_CORRECT)
                .details("Corrected attendance for " + user.getUsername() + " on " + request.date() + ". Reason: " + request.reason())
                .ipAddress(clientIp)
                .targetEntity("attendance")
                .targetId(saved.getId())
                .build());

        log.info("Admin '{}' corrected attendance for '{}' on {}", adminUsername, user.getUsername(), request.date());
        return saved;
    }

    private User getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));
    }
}
