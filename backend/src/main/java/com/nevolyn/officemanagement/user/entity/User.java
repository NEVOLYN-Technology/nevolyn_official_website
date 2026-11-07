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

    @Column(name = "secondary_bank_name", length = 255)
    private String secondaryBankName;

    @Column(name = "secondary_bank_account_name", length = 255)
    private String secondaryBankAccountName;

    @Column(name = "secondary_bank_account_number", length = 100)
    private String secondaryBankAccountNumber;

    @Column(name = "secondary_bank_branch", length = 255)
    private String secondaryBankBranch;

    @Column(name = "secondary_bank_routing_number", length = 100)
    private String secondaryBankRoutingNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private UserRole role;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = Instant.now();
        }
        if (this.isActive == null) {
            this.isActive = Boolean.TRUE;
        }
    }

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
     * Standard organizational hierarchy comparator:
     * 1. Role: SUPER_ADMIN (1) -> ADMIN (2) -> EMPLOYEE (3)
     * 2. Designation hierarchy: Founder (1) -> Co-Founder (2) -> other designations
     * 3. Joining Date: Seniority (earlier joining date first)
     * 4. Full Name: Alphabetical fallback
     */
    public static final java.util.Comparator<User> HIERARCHICAL_ORDER = (a, b) -> {
        if (a == b) return 0;
        if (a == null) return 1;
        if (b == null) return -1;

        // 1. Role rank
        int rankA = a.getRole() == UserRole.super_admin ? 1 : a.getRole() == UserRole.admin ? 2 : 3;
        int rankB = b.getRole() == UserRole.super_admin ? 1 : b.getRole() == UserRole.admin ? 2 : 3;
        if (rankA != rankB) return Integer.compare(rankA, rankB);

        // 2. Designation rank
        int desRankA = resolveDesignationRank(a.getDesignation());
        int desRankB = resolveDesignationRank(b.getDesignation());
        if (desRankA != desRankB) return Integer.compare(desRankA, desRankB);

        String desA = a.getDesignation() != null ? a.getDesignation().trim().toLowerCase() : "";
        String desB = b.getDesignation() != null ? b.getDesignation().trim().toLowerCase() : "";
        int desCmp = desA.compareTo(desB);
        if (desCmp != 0) return desCmp;

        // 3. Joining Date (earlier date first)
        if (a.getJoiningDate() != null && b.getJoiningDate() != null) {
            int dateCmp = a.getJoiningDate().compareTo(b.getJoiningDate());
            if (dateCmp != 0) return dateCmp;
        } else if (a.getJoiningDate() != null) {
            return -1;
        } else if (b.getJoiningDate() != null) {
            return 1;
        }

        // 4. Full Name fallback
        String nameA = a.getFullName() != null ? a.getFullName() : "";
        String nameB = b.getFullName() != null ? b.getFullName() : "";
        return nameA.compareToIgnoreCase(nameB);
    };

    private static int resolveDesignationRank(String designation) {
        if (designation == null || designation.isBlank()) return 99;
        String d = designation.trim().toLowerCase();
        if (d.contains("founder") && !d.contains("co-founder")) return 1;
        if (d.contains("co-founder")) return 2;
        return 10;
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
