package com.nevolyn.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Admin-facing response DTO for a JobApplication record.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminApplicationResponse {
    private Long id;
    private String applicationId;
    private String name;
    private String email;
    private String phone;
    private String nid;
    private String address;
    private String reason;
    private String linkedin;
    private String github;
    private String website;
    private String originalFileName;
    private Long fileSizeBytes;
    private String fileContentType;
    private Boolean isVerified;
    private LocalDateTime verifiedAt;
    private Boolean isAcknowledged;
    private LocalDateTime acknowledgedAt;
    private Boolean isSelected;
    private String selectionStatus;
    private LocalDateTime selectedAt;
    private String reviewNotes;
    private LocalDateTime createdAt;
}
