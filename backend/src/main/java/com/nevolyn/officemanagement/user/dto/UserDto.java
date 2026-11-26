package com.nevolyn.officemanagement.user.dto;

import com.nevolyn.officemanagement.user.entity.User;
import lombok.Builder;

import java.time.Instant;
import java.time.LocalDate;

// Data transfer object representing employee or administrator account details.
@Builder
public record UserDto(
        Long id,
        String employeeId,
        String username,
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
        String secondaryBankName,
        String secondaryBankAccountName,
        String secondaryBankAccountNumber,
        String secondaryBankBranch,
        String secondaryBankRoutingNumber,
        String photoUrl,
        String role,
        Boolean isActive,
        Instant createdAt
) {
    public static UserDto fromEntity(User user) {
        if (user == null) return null;
        return UserDto.builder()
                .id(user.getId())
                .employeeId(user.getEmployeeId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .designation(user.getDesignation())
                .joiningDate(user.getJoiningDate())
                .phone(user.getPhone())
                .email(user.getEmail())
                .bankName(user.getBankName())
                .bankAccountName(user.getBankAccountName())
                .bankAccountNumber(user.getBankAccountNumber())
                .bankBranch(user.getBankBranch())
                .bankRoutingNumber(user.getBankRoutingNumber())
                .secondaryBankName(user.getSecondaryBankName())
                .secondaryBankAccountName(user.getSecondaryBankAccountName())
                .secondaryBankAccountNumber(user.getSecondaryBankAccountNumber())
                .secondaryBankBranch(user.getSecondaryBankBranch())
                .secondaryBankRoutingNumber(user.getSecondaryBankRoutingNumber())
                .photoUrl(user.getPhotoUrl())
                .role(user.getRole() != null ? user.getRole().name() : null)
                .isActive(user.getIsActive())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
