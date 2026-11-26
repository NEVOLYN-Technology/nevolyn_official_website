package com.nevolyn.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response payload data for successful contact form submission.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContactResponse {
    private String inquiryId;
    private String status;
    private Boolean requiresVerification;
    private Boolean isVerified;
}
