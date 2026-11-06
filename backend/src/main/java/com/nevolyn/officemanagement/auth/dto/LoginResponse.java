package com.nevolyn.officemanagement.auth.dto;

import com.nevolyn.officemanagement.user.entity.User;

// Response payload after a successful login or profile fetch.
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
        String secondaryBankName,
        String secondaryBankAccountName,
        String secondaryBankAccountNumber,
        String secondaryBankBranch,
        String secondaryBankRoutingNumber,
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
                user.getSecondaryBankName(),
                user.getSecondaryBankAccountName(),
                user.getSecondaryBankAccountNumber(),
                user.getSecondaryBankBranch(),
                user.getSecondaryBankRoutingNumber(),
                effectiveRole,
                token);
    }
}
