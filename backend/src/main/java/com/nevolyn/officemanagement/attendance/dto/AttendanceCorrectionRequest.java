package com.nevolyn.officemanagement.attendance.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;
import java.time.LocalTime;

/**
 * Data transfer record encapsulating an administrative manual adjustment or correction
 * to an employee's check-in/check-out timestamp, presence status, and audit justification.
 */
public record AttendanceCorrectionRequest(
        @NotNull(message = "User ID is required")
        Long userId,

        @NotNull(message = "Date is required")
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
        LocalDate date,

        @DateTimeFormat(iso = DateTimeFormat.ISO.TIME)
        LocalTime checkInTime,

        @DateTimeFormat(iso = DateTimeFormat.ISO.TIME)
        LocalTime checkOutTime,

        String status,

        @NotBlank(message = "Correction reason is strictly required")
        String reason
) {}
