package com.nevolyn.officemanagement.user.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.time.LocalDate;

/**
 * Represents an employee or administrator account.
 *
 * <p>Maps to the {@code users} table (V1 &amp; V12 migrations).
 */
@Entity
@Table(name = "users")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"passwordHash"})
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "employee_id", nullable = false, unique = true, length = 50)
    private String employeeId;

    @Column(nullable = false, unique = true, length = 100)
    private String username;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(name = "full_name", nullable = false, length = 255)
    private String fullName;

    @Column(length = 255)
    private String designation;

    @Column(name = "joining_date")
    private LocalDate joiningDate;

    @Column(length = 30)
    private String phone;

    @Column(length = 255)
    private String email;

    @Column(name = "bank_name", length = 255)
    private String bankName;

    @Column(name = "bank_account_name", length = 255)
    private String bankAccountName;

    @Column(name = "bank_account_number", length = 100)
    private String bankAccountNumber;

    @Column(name = "bank_branch", length = 255)
    private String bankBranch;

    @Column(name = "bank_routing_number", length = 100)
    private String bankRoutingNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private UserRole role;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    /** Convenience method: true if this user has at least ADMIN-level privileges (admin or super_admin). */
    public boolean isAdmin() {
        return UserRole.admin.equals(this.role) || UserRole.super_admin.equals(this.role);
    }

    /** Convenience method: true if this user is a Super Administrator (highest privilege tier). */
    public boolean isSuperAdmin() {
        return UserRole.super_admin.equals(this.role);
    }

    /** Convenience method: true if this account is active. */
    public boolean isActive() {
        return Boolean.TRUE.equals(this.isActive);
    }

    /**
     * Three-tier role model:
     * <ul>
     *   <li>{@code super_admin} — system owner; max 2 accounts; manages ADMIN accounts</li>
     *   <li>{@code admin}       — office operations; manages EMPLOYEE accounts</li>
     *   <li>{@code employee}    — own data only</li>
     * </ul>
     */
    public enum UserRole {
        super_admin, admin, employee
    }
}
