package com.nevolyn.officemanagement.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

/**
 * Payload record for administrative updates to employee account profiles,
 * including full name, designation, department joining date, phone, email, banking details, and role.
 */
public record UpdateUserRequest(
        @NotBlank(message = "Full name is required")
        @Size(max = 255)
        String fullName,

        String designation,
        LocalDate joiningDate,
        String phone,
        String email,
        String bankName,
        String bankAccountName,
        String bankAccountNumber,
        String bankBranch,
        String bankRoutingNumber,

        @NotBlank(message = "Role is required")
        @Pattern(regexp = "super_admin|admin|employee", message = "Role must be 'super_admin', 'admin', or 'employee'")
        String role
) {
    /**
     * Convenience constructor for callers providing core fields without email/bank details.
     */
    public UpdateUserRequest(
            String fullName,
            String designation,
            LocalDate joiningDate,
            String phone,
            String role
    ) {
        this(
                fullName,
                designation,
                joiningDate,
                phone,
                null,
                null,
                null,
                null,
                null,
                null,
                role
        );
    }
}
