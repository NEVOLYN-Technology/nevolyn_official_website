package com.nevolyn.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response payload data for successful job application submission.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationResponse {
    private String applicationId;
    private String fileName;
    private String status;
    private Boolean requiresVerification;
    private Boolean isVerified;
}
