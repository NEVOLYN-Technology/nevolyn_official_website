package com.nevolyn.officemanagement.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Data transfer record for self-service profile, contact, and banking details updates by authenticated employees.
 *
 * <p>Protocol & Governance:
 * Requires current employee password for cryptographic identity verification before modifying
 * sensitive payroll and banking records.
 */
public record SelfProfileUpdateRequest(
        @Size(max = 30, message = "Phone number cannot exceed 30 characters")
        String phone,

        @Size(max = 255, message = "Email cannot exceed 255 characters")
        String email,

        @Size(max = 255, message = "Bank name cannot exceed 255 characters")
        String bankName,

        @Size(max = 255, message = "Bank account name cannot exceed 255 characters")
        String bankAccountName,

        @Size(max = 100, message = "Bank account number cannot exceed 100 characters")
        String bankAccountNumber,

        @Size(max = 255, message = "Bank branch cannot exceed 255 characters")
        String bankBranch,

        @Size(max = 100, message = "Bank routing number cannot exceed 100 characters")
        String bankRoutingNumber,

        @Size(max = 255, message = "Secondary bank name cannot exceed 255 characters")
        String secondaryBankName,

        @Size(max = 255, message = "Secondary bank account name cannot exceed 255 characters")
        String secondaryBankAccountName,

        @Size(max = 100, message = "Secondary bank account number cannot exceed 100 characters")
        String secondaryBankAccountNumber,

        @Size(max = 255, message = "Secondary bank branch cannot exceed 255 characters")
        String secondaryBankBranch,

        @Size(max = 100, message = "Secondary bank routing number cannot exceed 100 characters")
        String secondaryBankRoutingNumber,

        @Size(max = 500, message = "Photo URL cannot exceed 500 characters")
        String photoUrl,

        @NotBlank(message = "Current password is required to verify your identity")
        String currentPassword
) {}

