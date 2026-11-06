package com.nevolyn.officemanagement.attendance.dto;

import lombok.Builder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

/**
 * Data transfer record representing an administrative view of an employee's daily attendance record.
 * Includes calculated presence status, shift punctuality, working hours, and admin adjustment notes.
 */
@Builder
public record AdminAttendanceRecordDto(
        Long id,
        Long userId,
        String employeeId,
        String fullName,
        String designation,
        LocalDate date,
        LocalTime checkInTime,
        LocalTime checkOutTime,
        BigDecimal totalHours,
        String status,
        String lateStatus,
        String earlyCheckout,
        String notes
) {}
