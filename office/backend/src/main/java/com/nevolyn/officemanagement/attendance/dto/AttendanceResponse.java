package com.nevolyn.officemanagement.attendance.dto;

import com.nevolyn.officemanagement.attendance.entity.Attendance;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

/**
 * Attendance record response DTO.
 */
public record AttendanceResponse(
        Long id,
        Long userId,
        String employeeId,
        String fullName,
        LocalDate date,
        LocalTime checkInTime,
        LocalTime checkOutTime,
        BigDecimal totalHours,
        String lateStatus,
        String earlyCheckout,
        String status,
        String presenceBadge   // ABSENT | IN HOUSE | PRESENT
) {
    public static AttendanceResponse from(Attendance a) {
        String badge;
        if (a.getCheckInTime() == null) {
            badge = "ABSENT";
        } else if (a.getCheckOutTime() == null) {
            badge = "IN HOUSE";
        } else {
            badge = "PRESENT";
        }

        return new AttendanceResponse(
                a.getId(),
                a.getUser().getId(),
                a.getUser().getEmployeeId(),
                a.getUser().getFullName(),
                a.getDate(),
                a.getCheckInTime(),
                a.getCheckOutTime(),
                a.getTotalHours(),
                a.getLateStatus().getDisplayName(),
                a.getEarlyCheckout().getDisplayName(),
                a.getStatus().name(),
                badge
        );
    }
}
