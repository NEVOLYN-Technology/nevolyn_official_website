package com.nevolyn.officemanagement.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Login request body.
 */
public record LoginRequest(
        @NotBlank(message = "Username is required")
        @Size(max = 100, message = "Username must be at most 100 characters")
        String username,

        @NotBlank(message = "Password is required")
        @Size(max = 100, message = "Password must be at most 100 characters")
        String password
) {}
