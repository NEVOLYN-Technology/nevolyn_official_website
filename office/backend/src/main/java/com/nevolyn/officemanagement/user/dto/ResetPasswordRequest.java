package com.nevolyn.officemanagement.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Payload record for administrative password resets for specific employee accounts.
 * Enforces minimum length requirements on newly assigned passwords.
 */
public record ResetPasswordRequest(
        @NotBlank(message = "New password is required")
        @Size(min = 6, message = "Password must be at least 6 characters")
        String newPassword
) {}
