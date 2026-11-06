package com.nevolyn.officemanagement.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Data transfer record for self-service password changes by authenticated users.
 * Enforces validation rules on current credentials and minimum length on new credentials.
 */
public record SelfPasswordChangeRequest(
        @NotBlank(message = "Current password is required")
        String currentPassword,

        @NotBlank(message = "New password is required")
        @Size(min = 6, message = "New password must be at least 6 characters")
        String newPassword,

        @NotBlank(message = "Confirmation password is required")
        String confirmPassword
) {}
