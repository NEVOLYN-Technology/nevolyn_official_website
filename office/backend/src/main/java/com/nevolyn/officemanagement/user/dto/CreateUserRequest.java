package com.nevolyn.officemanagement.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

/**
 * Payload record for registering a new employee or administrator account, specifying corporate ID,
 * login credentials, personal profile details, banking information, and role permissions.
 */
public record CreateUserRequest(
        @NotBlank(message = "Employee ID is required")
        @Size(max = 50)
        String employeeId,

        @NotBlank(message = "Username is required")
        @Size(min = 3, max = 50)
        String username,

        @NotBlank(message = "Password is required")
        @Size(min = 6, message = "Password must be at least 6 characters")
        String password,

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
    public CreateUserRequest(
            String employeeId,
            String username,
            String password,
            String fullName,
            String designation,
            LocalDate joiningDate,
            String phone,
            String role
    ) {
        this(
                employeeId,
                username,
                password,
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
