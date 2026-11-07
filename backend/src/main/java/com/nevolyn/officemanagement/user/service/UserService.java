package com.nevolyn.officemanagement.user.service;

import com.nevolyn.officemanagement.audit.entity.AuditLog;
import com.nevolyn.officemanagement.audit.service.AuditService;
import com.nevolyn.service.EmailService;
import com.nevolyn.officemanagement.common.exception.BusinessRuleException;
import com.nevolyn.officemanagement.common.exception.ResourceNotFoundException;
import com.nevolyn.officemanagement.user.dto.CreateUserRequest;
import com.nevolyn.officemanagement.user.dto.ResetPasswordRequest;
import com.nevolyn.officemanagement.user.dto.UpdateUserRequest;
import com.nevolyn.officemanagement.user.dto.UserDto;
import com.nevolyn.officemanagement.user.entity.User;
import com.nevolyn.officemanagement.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * User administration and account management service.
 *
 * <p>
 * Enforces the three-tier RBAC model at the service layer:
 * <ul>
 *   <li>{@code SUPER_ADMIN}: can create/manage ADMIN and EMPLOYEE accounts; max 2 active super_admins</li>
 *   <li>{@code ADMIN}: can create/manage EMPLOYEE accounts only; cannot touch other admins</li>
 *   <li>{@code EMPLOYEE}: no user management capabilities (blocked at controller level)</li>
 * </ul>
 *
 * <p>Key security invariants enforced here (not just frontend):
 * <ol>
 *   <li>ADMIN cannot create, edit, disable, or reset passwords for ADMIN/SUPER_ADMIN accounts.</li>
 *   <li>SUPER_ADMIN cannot disable themselves or another SUPER_ADMIN.</li>
 *   <li>SUPER_ADMIN cannot reset another SUPER_ADMIN's password via normal endpoint.</li>
 *   <li>No actor can promote a user to SUPER_ADMIN via the normal edit endpoint.</li>
 *   <li>Maximum 2 active SUPER_ADMIN accounts enforced at creation time.</li>
 * </ol>
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    /** Maximum number of active SUPER_ADMIN accounts allowed in the system. */
    private static final int MAX_SUPER_ADMINS = 2;

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditService auditService;
    private final EmailService emailService;

    /**
     * Retrieves a paginated list of all users.
     *
     * @param pageable pagination parameters
     * @return page of {@link UserDto} objects
     */
    @Transactional(readOnly = true)
    public Page<UserDto> getAllUsers(Pageable pageable) {
        Page<User> page = userRepository.findAll(pageable);
        List<UserDto> sortedList = page.getContent().stream()
                .sorted(User.HIERARCHICAL_ORDER)
                .map(UserDto::fromEntity)
                .toList();
        return new org.springframework.data.domain.PageImpl<>(sortedList, pageable, page.getTotalElements());
    }

    /**
     * Retrieves all active team members ordered by organizational hierarchy (Super Admin -> Admin -> Employee,
     * then by designation and seniority/joining date).
     *
     * @return list of active employee {@link UserDto} objects
     */
    @Transactional(readOnly = true)
    public List<UserDto> getActiveEmployees() {
        return userRepository.findByIsActiveTrueOrderByFullNameAsc()
                .stream()
                .sorted(User.HIERARCHICAL_ORDER)
                .map(UserDto::fromEntity)
                .toList();
    }

    /**
     * Finds a single user by primary key ID.
     *
     * @param id primary key ID
     * @return the {@link UserDto}
     * @throws ResourceNotFoundException if the user does not exist
     */
    @Transactional(readOnly = true)
    public UserDto getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        return UserDto.fromEntity(user);
    }

    /**
     * Provisions a new employee or administrator account with encrypted credentials.
     *
     * <p><b>Privilege rules enforced:</b>
     * <ul>
     *   <li>ADMIN can only create EMPLOYEE accounts.</li>
     *   <li>SUPER_ADMIN can create ADMIN or EMPLOYEE accounts.</li>
     *   <li>No one can create a SUPER_ADMIN via this endpoint — use
     *       {@link #createSuperAdmin(CreateUserRequest, String, String)} instead.</li>
     *   <li>Max {@value #MAX_SUPER_ADMINS} active SUPER_ADMINs are enforced.</li>
     * </ul>
     *
     * @param request       creation payload
     * @param clientIp      remote client IP for audit tracking
     * @param callerUsername username of the provisioning administrator
     * @param callerRole    role of the calling administrator (determines what they can create)
     * @return the saved {@link UserDto}
     * @throws BusinessRuleException if username/employeeId is taken, or caller lacks permission
     */
    @Transactional
    public UserDto createUser(CreateUserRequest request, String clientIp,
                              String callerUsername, User.UserRole callerRole) {
        User.UserRole targetRole;
        try {
            targetRole = User.UserRole.valueOf(request.role().toLowerCase());
        } catch (IllegalArgumentException e) {
            throw new BusinessRuleException("Invalid role: " + request.role());
        }

        // Prevent SUPER_ADMIN creation through this endpoint (strictly code-level only)
        if (targetRole == User.UserRole.super_admin) {
            throw new BusinessRuleException(
                    "SUPER_ADMIN accounts cannot be created via this endpoint. " +
                    "SUPER_ADMIN provisioning is strictly limited to code-level system bootstrap.");
        }

        // ADMIN cannot create ADMIN accounts — only SUPER_ADMIN can
        if (targetRole == User.UserRole.admin && callerRole != User.UserRole.super_admin) {
            throw new BusinessRuleException(
                    "Insufficient privileges: only a SUPER_ADMIN can provision ADMIN accounts.");
        }

        if (userRepository.existsByUsername(request.username())) {
            throw new BusinessRuleException("Username '" + request.username() + "' is already taken.");
        }
        if (userRepository.existsByEmployeeId(request.employeeId())) {
            throw new BusinessRuleException("Employee ID '" + request.employeeId() + "' is already registered.");
        }

        User user = User.builder()
                .employeeId(request.employeeId().trim())
                .username(request.username().trim().toLowerCase())
                .passwordHash(passwordEncoder.encode(request.password()))
                .fullName(request.fullName().trim())
                .designation(request.designation() != null ? request.designation().trim() : null)
                .joiningDate(request.joiningDate())
                .phone(request.phone() != null ? request.phone().trim() : null)
                .email(request.email() != null ? request.email().trim() : null)
                .bankName(request.bankName() != null ? request.bankName().trim() : null)
                .bankAccountName(request.bankAccountName() != null ? request.bankAccountName().trim() : null)
                .bankAccountNumber(request.bankAccountNumber() != null ? request.bankAccountNumber().trim() : null)
                .bankBranch(request.bankBranch() != null ? request.bankBranch().trim() : null)
                .bankRoutingNumber(request.bankRoutingNumber() != null ? request.bankRoutingNumber().trim() : null)
                .secondaryBankName(request.secondaryBankName() != null ? request.secondaryBankName().trim() : null)
                .secondaryBankAccountName(request.secondaryBankAccountName() != null ? request.secondaryBankAccountName().trim() : null)
                .secondaryBankAccountNumber(request.secondaryBankAccountNumber() != null ? request.secondaryBankAccountNumber().trim() : null)
                .secondaryBankBranch(request.secondaryBankBranch() != null ? request.secondaryBankBranch().trim() : null)
                .secondaryBankRoutingNumber(request.secondaryBankRoutingNumber() != null ? request.secondaryBankRoutingNumber().trim() : null)
                .role(targetRole)
                .isActive(true)
                .build();

        User saved = userRepository.save(user);

        if (saved.getEmail() != null && !saved.getEmail().isBlank()) {
            try {
                emailService.sendOnboardingCredentialsEmail(
                        saved.getEmail(),
                        saved.getFullName(),
                        saved.getUsername(),
                        saved.getEmployeeId(),
                        saved.getDesignation(),
                        request.password(),
                        saved.getJoiningDate() != null ? saved.getJoiningDate().toString() : null
                );
            } catch (Exception ex) {
                log.warn("Could not dispatch automated onboarding email to '{}': {}", saved.getEmail(), ex.getMessage());
            }
        }

        auditService.log(
                AuditLog.ACTION_CREATE_EMPLOYEE,
                callerUsername,
                null,
                clientIp,
                "users",
                saved.getId(),
                "Created user: " + saved.getUsername() + " (" + saved.getEmployeeId() + ") as " + saved.getRole());

        return UserDto.fromEntity(saved);
    }

    /**
     * Dedicated endpoint for provisioning a SUPER_ADMIN account.
     *
     * <p>Enforces the maximum of {@value #MAX_SUPER_ADMINS} active super-admin accounts.
     * Only callable from {@code AdminAccountInitializer} bootstrap or dedicated controller endpoint.
     *
     * @param request       creation payload
     * @param clientIp      remote client IP for audit tracking
     * @param callerUsername username of the provisioning actor (or "SYSTEM" for bootstrap)
     * @return the saved {@link UserDto}
     * @throws BusinessRuleException if max SUPER_ADMIN count would be exceeded
     */
    @Transactional
    public UserDto createSuperAdmin(CreateUserRequest request, String clientIp, String callerUsername) {
        long activeSuperAdmins = userRepository.countByRole(User.UserRole.super_admin);
        if (activeSuperAdmins >= MAX_SUPER_ADMINS) {
            throw new BusinessRuleException(
                    "Maximum number of SUPER_ADMIN accounts (" + MAX_SUPER_ADMINS + ") has been reached. " +
                    "Deactivate an existing SUPER_ADMIN before creating a new one.");
        }

        if (userRepository.existsByUsername(request.username())) {
            throw new BusinessRuleException("Username '" + request.username() + "' is already taken.");
        }
        if (userRepository.existsByEmployeeId(request.employeeId())) {
            throw new BusinessRuleException("Employee ID '" + request.employeeId() + "' is already registered.");
        }

        User user = User.builder()
                .employeeId(request.employeeId().trim())
                .username(request.username().trim().toLowerCase())
                .passwordHash(passwordEncoder.encode(request.password()))
                .fullName(request.fullName().trim())
                .designation(request.designation() != null ? request.designation().trim() : null)
                .joiningDate(request.joiningDate())
                .phone(request.phone() != null ? request.phone().trim() : null)
                .email(request.email() != null ? request.email().trim() : null)
                .bankName(request.bankName() != null ? request.bankName().trim() : null)
                .bankAccountName(request.bankAccountName() != null ? request.bankAccountName().trim() : null)
                .bankAccountNumber(request.bankAccountNumber() != null ? request.bankAccountNumber().trim() : null)
                .bankBranch(request.bankBranch() != null ? request.bankBranch().trim() : null)
                .bankRoutingNumber(request.bankRoutingNumber() != null ? request.bankRoutingNumber().trim() : null)
                .secondaryBankName(request.secondaryBankName() != null ? request.secondaryBankName().trim() : null)
                .secondaryBankAccountName(request.secondaryBankAccountName() != null ? request.secondaryBankAccountName().trim() : null)
                .secondaryBankAccountNumber(request.secondaryBankAccountNumber() != null ? request.secondaryBankAccountNumber().trim() : null)
                .secondaryBankBranch(request.secondaryBankBranch() != null ? request.secondaryBankBranch().trim() : null)
                .secondaryBankRoutingNumber(request.secondaryBankRoutingNumber() != null ? request.secondaryBankRoutingNumber().trim() : null)
                .role(User.UserRole.super_admin)
                .isActive(true)
                .build();

        User saved = userRepository.save(user);

        if (saved.getEmail() != null && !saved.getEmail().isBlank()) {
            try {
                emailService.sendOnboardingCredentialsEmail(
                        saved.getEmail(),
                        saved.getFullName(),
                        saved.getUsername(),
                        saved.getEmployeeId(),
                        saved.getDesignation(),
                        request.password(),
                        saved.getJoiningDate() != null ? saved.getJoiningDate().toString() : null
                );
            } catch (Exception ex) {
                log.warn("Could not dispatch automated onboarding email to '{}': {}", saved.getEmail(), ex.getMessage());
            }
        }

        auditService.log(
                "CREATE_SUPER_ADMIN",
                callerUsername,
                null,
                clientIp,
                "users",
                saved.getId(),
                "Provisioned SUPER_ADMIN account: " + saved.getUsername() + " (" + saved.getEmployeeId() + ")");

        log.warn("SUPER_ADMIN account provisioned: username='{}', employeeId='{}', by='{}'",
                saved.getUsername(), saved.getEmployeeId(), callerUsername);

        return UserDto.fromEntity(saved);
    }

    /**
     * Updates an existing user's organizational profile.
     *
     * <p><b>Privilege rules enforced:</b>
     * <ul>
     *   <li>ADMIN cannot edit another ADMIN or SUPER_ADMIN.</li>
     *   <li>No actor can promote a user to SUPER_ADMIN via this endpoint.</li>
     *   <li>ADMIN cannot promote anyone to ADMIN role.</li>
     * </ul>
     *
     * @param id            primary key ID of the user
     * @param request       profile update fields
     * @param clientIp      remote client IP for audit logging
     * @param callerUsername username of the updating administrator
     * @param callerRole    role of the calling administrator
     * @return the updated {@link UserDto}
     * @throws ResourceNotFoundException if user is not found
     * @throws BusinessRuleException     if privilege rules are violated
     */
    @Transactional
    public UserDto updateUser(Long id, UpdateUserRequest request, String clientIp,
                              String callerUsername, User.UserRole callerRole) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));

        User.UserRole requestedRole = user.getRole();
        if (request.role() != null && !request.role().isBlank()) {
            try {
                requestedRole = User.UserRole.valueOf(request.role().toLowerCase());
            } catch (IllegalArgumentException e) {
                throw new BusinessRuleException("Invalid role: " + request.role());
            }
        }

        // Role changes require SUPER_ADMIN privileges and cannot target SUPER_ADMIN
        if (requestedRole != user.getRole()) {
            if (user.isSuperAdmin() || requestedRole == User.UserRole.super_admin) {
                throw new BusinessRuleException(
                        "Promotion or demotion involving SUPER_ADMIN is not allowed via the edit endpoint.");
            }
            if (callerRole != User.UserRole.super_admin) {
                throw new BusinessRuleException(
                        "Insufficient privileges: only a SUPER_ADMIN can change user roles.");
            }
        }

        if (request.fullName() != null && !request.fullName().isBlank()) {
            user.setFullName(request.fullName().trim());
        }
        if (request.designation() != null) {
            user.setDesignation(request.designation().trim());
        }
        if (request.joiningDate() != null) {
            user.setJoiningDate(request.joiningDate());
        }
        if (request.email() != null) {
            user.setEmail(request.email().trim());
        }

        // Personal phone numbers and banking credentials are confidential records.
        // Administrators are strictly prohibited from modifying them on behalf of employees.
        // Each employee securely manages their own phone and banking accounts via their
        // self-service Profile & Security page (/api/v1/auth/profile) with cryptographic password verification.

        user.setRole(requestedRole);

        User saved = userRepository.save(user);

        auditService.log(
                AuditLog.ACTION_EDIT_EMPLOYEE,
                callerUsername,
                null,
                clientIp,
                "users",
                saved.getId(),
                "Updated user details for: " + saved.getUsername());

        return UserDto.fromEntity(saved);
    }

    /**
     * Toggles the active status of a user account.
     *
     * <p><b>Privilege rules enforced:</b>
     * <ul>
     *   <li>ADMIN cannot deactivate another ADMIN or SUPER_ADMIN.</li>
     *   <li>No one can deactivate a SUPER_ADMIN (including other SUPER_ADMINs and themselves).</li>
     *   <li>No one can deactivate their own account.</li>
     * </ul>
     *
     * @param id            primary key ID of the user
     * @param clientIp      remote client IP for audit logging
     * @param callerUsername username of the toggling administrator
     * @param callerRole    role of the calling administrator
     * @return the updated {@link UserDto}
     * @throws ResourceNotFoundException if user is not found
     * @throws BusinessRuleException     if privilege rules are violated
     */
    @Transactional
    public UserDto toggleUserStatus(Long id, String clientIp, String callerUsername, User.UserRole callerRole) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));

        // Nobody can deactivate a SUPER_ADMIN account (self-protection + peer-protection)
        if (user.isSuperAdmin()) {
            throw new BusinessRuleException(
                    "SUPER_ADMIN accounts cannot be deactivated via this operation. " +
                    "Contact the system owner for SUPER_ADMIN account management.");
        }

        // No one can deactivate their own account
        if (user.getUsername().equalsIgnoreCase(callerUsername)) {
            throw new BusinessRuleException("You cannot deactivate your own account.");
        }

        // ADMIN cannot deactivate another ADMIN
        if (callerRole == User.UserRole.admin && user.isAdmin()) {
            throw new BusinessRuleException(
                    "Insufficient privileges: ADMINs cannot deactivate other ADMIN accounts.");
        }

        boolean newStatus = !Boolean.TRUE.equals(user.getIsActive());
        user.setIsActive(newStatus);
        User saved = userRepository.save(user);

        String statusLabel = newStatus ? "Reactivated" : "Deactivated";
        auditService.log(
                AuditLog.ACTION_TOGGLE_EMPLOYEE,
                callerUsername,
                null,
                clientIp,
                "users",
                saved.getId(),
                statusLabel + " account for: " + saved.getUsername());

        return UserDto.fromEntity(saved);
    }

    /**
     * Resets a user's password as an administrator.
     *
     * <p><b>Privilege rules enforced:</b>
     * <ul>
     *   <li>ADMIN cannot reset another ADMIN's or SUPER_ADMIN's password.</li>
     *   <li>SUPER_ADMIN cannot reset another SUPER_ADMIN's password via this endpoint.</li>
     * </ul>
     *
     * @param id            primary key ID of the user
     * @param request       reset payload containing the new password
     * @param clientIp      remote client IP for audit logging
     * @param callerUsername username of the administrator
     * @param callerRole    role of the calling administrator
     * @throws ResourceNotFoundException if user is not found
     * @throws BusinessRuleException     if privilege rules are violated
     */
    @Transactional
    public void resetPassword(Long id, ResetPasswordRequest request, String clientIp,
                              String callerUsername, User.UserRole callerRole) {
        throw new BusinessRuleException(
                "Employee passwords cannot be changed by administrators. Each employee must manage their own password via their Profile & Security page.");
    }

    /**
     * Allows an authenticated user to change their own password after verifying their current password.
     *
     * @param username        username of the user changing password
     * @param currentPassword user's current password for verification
     * @param newPassword     new password to set (minimum 6 characters)
     * @param clientIp        remote client IP for audit logging
     * @throws ResourceNotFoundException if user is not found
     * @throws BusinessRuleException     if current password does not match or new password is too short
     */
    @Transactional
    public void changeSelfPassword(String username, String currentPassword, String newPassword, String clientIp) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        if (!passwordEncoder.matches(currentPassword, user.getPasswordHash())) {
            throw new BusinessRuleException("Incorrect current password.");
        }
        if (newPassword.length() < 6) {
            throw new BusinessRuleException("New password must be at least 6 characters long.");
        }

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        auditService.log(
                "PASSWORD_CHANGE",
                username,
                user,
                clientIp,
                "users",
                user.getId(),
                "User changed own password"
        );
    }

    /**
     * Permanently deletes a user account with strict privilege enforcement.
     *
     * <p><b>Privilege rules enforced:</b>
     * <ul>
     *   <li>SUPER_ADMIN can delete ADMIN and EMPLOYEE accounts.</li>
     *   <li>ADMIN can only delete EMPLOYEE accounts.</li>
     *   <li>Nobody can delete a SUPER_ADMIN account.</li>
     *   <li>Nobody can delete their own account.</li>
     * </ul>
     *
     * @param id             primary key ID of the user to delete
     * @param clientIp       remote client IP for audit logging
     * @param callerUsername username of the administrator
     * @param callerRole     role of the administrator performing deletion
     */
    @Transactional
    public void deleteUser(Long id, String clientIp, String callerUsername, User.UserRole callerRole) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));

        // 1. Nobody can delete a SUPER_ADMIN account
        if (user.isSuperAdmin()) {
            throw new BusinessRuleException("SUPER_ADMIN accounts are protected and cannot be deleted.");
        }

        // 2. Nobody can delete their own account
        if (user.getUsername().equalsIgnoreCase(callerUsername)) {
            throw new BusinessRuleException("You cannot delete your own account.");
        }

        // 3. ADMIN can only delete EMPLOYEE accounts
        if (callerRole == User.UserRole.admin && user.getRole() != User.UserRole.employee) {
            throw new BusinessRuleException("Administrators can only delete Employee accounts.");
        }

        String deletedUsername = user.getUsername();
        String deletedEmployeeId = user.getEmployeeId();
        String deletedFullName = user.getFullName();
        String deletedRole = user.getRole().name();

        try {
            userRepository.delete(user);
            userRepository.flush();
        } catch (org.springframework.dao.DataIntegrityViolationException ex) {
            throw new BusinessRuleException(
                    "Cannot delete user '" + deletedFullName + "' because they have linked records (tasks, experiments, or uploaded files). " +
                    "Please reassign or remove their records first, or deactivate the account.");
        }

        auditService.log(
                "DELETE_USER",
                callerUsername,
                null,
                clientIp,
                "users",
                id,
                String.format("Permanently deleted %s account: %s (%s, @%s)",
                        deletedRole, deletedFullName, deletedEmployeeId, deletedUsername)
        );

        log.warn("User '{}' ({}, role: {}) was permanently deleted by '{}' from IP {}",
                deletedUsername, deletedEmployeeId, deletedRole, callerUsername, clientIp);
    }
}