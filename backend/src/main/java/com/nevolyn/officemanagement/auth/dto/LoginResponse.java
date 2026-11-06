package com.nevolyn.officemanagement.auth.dto;

import com.nevolyn.officemanagement.user.entity.User;

/**
 * Response payload after a successful login or profile fetch.
 *
 * <p>The JWT token is also set in an HTTP-only cookie by the controller.
 * This response body provides the user info and active session role needed by the frontend.
 */
public record LoginResponse(
        Long id,
        String username,
        String fullName,
        String employeeId,
        String designation,
        String phone,
        String email,
        String bankName,
        String bankAccountName,
        String bankAccountNumber,
        String bankBranch,
        String bankRoutingNumber,
        String role,
        String token
) {
    public static LoginResponse from(User user) {
        return from(user, null, null);
    }

    public static LoginResponse from(User user, String token) {
        return from(user, token, null);
    }

    public static LoginResponse from(User user, String token, String activeRoleOverride) {
        String effectiveRole = (activeRoleOverride != null && !activeRoleOverride.isBlank())
                ? activeRoleOverride
                : (user.getRole() != null ? user.getRole().name() : null);

        return new LoginResponse(
                user.getId(),
                user.getUsername(),
                user.getFullName(),
                user.getEmployeeId(),
                user.getDesignation(),
                user.getPhone(),
                user.getEmail(),
                user.getBankName(),
                user.getBankAccountName(),
                user.getBankAccountNumber(),
                user.getBankBranch(),
                user.getBankRoutingNumber(),
                effectiveRole,
                token);
    }
}
