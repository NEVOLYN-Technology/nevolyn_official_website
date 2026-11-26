package com.nevolyn.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Admin-facing response DTO for a ContactInquiry record.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminInquiryResponse {
    private Long id;
    private String inquiryId;
    private String name;
    private String email;
    private String subject;
    private String message;
    private Boolean isVerified;
    private LocalDateTime verifiedAt;
    private Boolean isAcknowledged;
    private LocalDateTime acknowledgedAt;
    private String status;
    private LocalDateTime createdAt;
}
