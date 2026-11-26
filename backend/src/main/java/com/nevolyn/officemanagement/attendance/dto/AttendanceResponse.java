package com.nevolyn.officemanagement.attendance.dto;

import com.nevolyn.officemanagement.attendance.entity.Attendance;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

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
        String presenceBadge
) {
    public static AttendanceResponse from(Attendance a) {
        if (a == null) {
            return null;
        }

        String badge;
        if (a.getCheckInTime() == null) {
            badge = "ABSENT";
        } else if (a.getCheckOutTime() == null) {
            badge = "IN HOUSE";
        } else {
            badge = "PRESENT";
        }

        Long userId = null;
        String employeeId = "";
        String fullName = "";
        if (a.getUser() != null) {
            userId = a.getUser().getId();
            employeeId = a.getUser().getEmployeeId() != null ? a.getUser().getEmployeeId() : "";
            fullName = a.getUser().getFullName() != null ? a.getUser().getFullName() : "";
        }

        BigDecimal totalHours = a.getTotalHours() != null ? a.getTotalHours() : BigDecimal.ZERO;
        String lateStatus = a.getLateStatus() != null ? a.getLateStatus().getDisplayName() : "On Time";
        String earlyCheckout = a.getEarlyCheckout() != null ? a.getEarlyCheckout().getDisplayName() : "No";
        String status = a.getStatus() != null ? a.getStatus().name() : "PRESENT";

        return new AttendanceResponse(
                a.getId(),
                userId,
                employeeId,
                fullName,
                a.getDate(),
                a.getCheckInTime(),
                a.getCheckOutTime(),
                totalHours,
                lateStatus,
                earlyCheckout,
                status,
                badge
        );
    }
}
