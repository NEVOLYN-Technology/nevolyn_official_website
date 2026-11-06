package com.nevolyn.officemanagement.attendance.policy;

import com.nevolyn.officemanagement.attendance.entity.Attendance;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.time.LocalTime;

/**
 * Attendance business rules — encapsulated in a dedicated policy class.
 *
 * <p>This is the Java equivalent of the attendance logic documented in
 * Section 8 (Business Logic & Attendance Engine) of PROJECT_DOCUMENTATION.md.
 *
 * <p>Rules:
 * <ul>
 *   <li>Check-in at or before 12:00 PM → {@code LateStatus.ON_TIME}</li>
 *   <li>Check-in after 12:00 PM       → {@code LateStatus.LATE}</li>
 *   <li>Check-out before 5:00 PM      → {@code EarlyCheckout.YES}</li>
 *   <li>Check-out at or after 5:00 PM → {@code EarlyCheckout.NO}</li>
 * </ul>
 *
 * <p>Cutoff times are configurable via {@code application.yml} so they can be
 * adjusted without a code change.
 */
@Slf4j
@Component
public class AttendancePolicy {

    private final LocalTime checkInCutoff;
    private final LocalTime checkOutCutoff;

    public AttendancePolicy(
            @Value("${app.attendance.late-threshold-time:09:15:00}") String checkInTimeStr,
            @Value("${app.attendance.office-end-time:18:00:00}") String checkOutTimeStr
    ) {
        LocalTime parsedCheckIn;
        try {
            parsedCheckIn = LocalTime.parse(checkInTimeStr);
        } catch (Exception e) {
            parsedCheckIn = LocalTime.of(9, 15);
        }
        LocalTime parsedCheckOut;
        try {
            parsedCheckOut = LocalTime.parse(checkOutTimeStr);
        } catch (Exception e) {
            parsedCheckOut = LocalTime.of(18, 0);
        }

        this.checkInCutoff  = parsedCheckIn;
        this.checkOutCutoff = parsedCheckOut;
        log.info("AttendancePolicy initialized: check-in cutoff = {}, check-out cutoff = {}",
                checkInCutoff, checkOutCutoff);
    }

    /**
     * Determine late status based on check-in time.
     *
     * <p>{@code checkInTime <= 12:00} → On Time
     * <p>{@code checkInTime > 12:00}  → Late
     *
     * @param checkInTime the time of check-in
     * @return {@code ON_TIME} or {@code LATE}
     */
    public Attendance.LateStatus determineLateStatus(LocalTime checkInTime) {
        if (checkInTime == null) {
            return Attendance.LateStatus.LATE;
        }
        // "On Time" if check-in is at or before the cutoff
        boolean onTime = !checkInTime.isAfter(checkInCutoff);
        Attendance.LateStatus status = onTime ? Attendance.LateStatus.ON_TIME : Attendance.LateStatus.LATE;
        log.debug("Check-in at {} vs cutoff {}: {}", checkInTime, checkInCutoff, status);
        return status;
    }

    /**
     * Determine early checkout status based on check-out time.
     *
     * <p>{@code checkOutTime < 17:00}  → Early Checkout
     * <p>{@code checkOutTime >= 17:00} → Normal Checkout
     *
     * @param checkOutTime the time of check-out
     * @return {@code YES} (early) or {@code NO} (normal)
     */
    public Attendance.EarlyCheckout determineEarlyCheckout(LocalTime checkOutTime) {
        if (checkOutTime == null) {
            return Attendance.EarlyCheckout.NO;
        }
        // "Early" if check-out is strictly before the cutoff
        boolean earlyLeave = checkOutTime.isBefore(checkOutCutoff);
        Attendance.EarlyCheckout result = earlyLeave ? Attendance.EarlyCheckout.YES : Attendance.EarlyCheckout.NO;
        log.debug("Check-out at {} vs cutoff {}: {}", checkOutTime, checkOutCutoff, result);
        return result;
    }

    /**
     * Calculate total working hours between check-in and check-out.
     * Result is always non-negative.
     *
     * @param checkIn  check-in time
     * @param checkOut check-out time
     * @return hours as a double, rounded to 2 decimal places, minimum 0
     */
    public double calculateTotalHours(LocalTime checkIn, LocalTime checkOut) {
        if (checkIn == null || checkOut == null) return 0.0;
        long seconds = java.time.Duration.between(checkIn, checkOut).getSeconds();
        double hours = seconds / 3600.0;
        return Math.max(0.0, Math.round(hours * 100.0) / 100.0);
    }

    /**
     * Validate whether the user is eligible to record attendance.
     *
     * @return true if the user is active
     */
    public boolean isEligibleForAttendance(com.nevolyn.officemanagement.user.entity.User user) {
        return user != null && user.isActive();
    }

    /** The configured check-in cutoff time. */
    public LocalTime getCheckInCutoff() { return checkInCutoff; }

    /** The configured check-out cutoff time. */
    public LocalTime getCheckOutCutoff() { return checkOutCutoff; }
}
