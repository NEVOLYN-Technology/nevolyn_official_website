package com.nevolyn.officemanagement.user.dto;

import com.nevolyn.officemanagement.user.entity.User;
import lombok.Builder;

import java.time.Instant;
import java.time.LocalDate;

/**
 * Data transfer object representing employee or administrator account details.
 *
 * <p>Excludes sensitive credentials such as password hashes while providing
 * employment identifiers, contact details, banking information, and access roles.</p>
 */
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
                .role(user.getRole() != null ? user.getRole().name() : null)
                .isActive(user.getIsActive())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
