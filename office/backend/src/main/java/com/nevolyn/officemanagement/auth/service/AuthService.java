package com.nevolyn.officemanagement.auth.service;

import com.nevolyn.officemanagement.audit.entity.AuditLog;
import com.nevolyn.officemanagement.audit.service.AuditService;
import com.nevolyn.officemanagement.auth.dto.LoginRequest;
import com.nevolyn.officemanagement.auth.dto.LoginResponse;
import com.nevolyn.officemanagement.common.exception.ResourceNotFoundException;
import com.nevolyn.officemanagement.security.jwt.JwtTokenProvider;
import com.nevolyn.officemanagement.user.entity.User;
import com.nevolyn.officemanagement.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Authentication business logic supporting role-tiered password login.
 *
 * <p>Allows unified personnel accounts (e.g. {@code rahinrahman}, {@code mninadmnobo}, {@code afzalhossan})
 * to log in with different role levels depending on the password entered:
 * <ul>
 *   <li><b>Super Admin Password</b> ({@code SUPER_ADMIN_SHARED_PASSWORD}): logs in {@code SUPER_ADMIN} users as {@code super_admin}</li>
 *   <li><b>Admin Password</b> ({@code ADMIN_SHARED_PASSWORD}): logs in {@code SUPER_ADMIN} or {@code ADMIN} users as {@code admin}</li>
 *   <li><b>Individual Employee Password</b> (user's personal BCrypt {@code passwordHash}): logs in the user as {@code employee}
 *       (or their stored role if an admin account has no separate employee password)</li>
 * </ul>
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final JwtTokenProvider jwtTokenProvider;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditService auditService;

    @Value("${SUPER_ADMIN_SHARED_PASSWORD:N0b0#R@h1n!F4B1NS$S4turn_N3v0Lyn@26}")
    private String superAdminSharedPassword;

    @Value("${ADMIN_SHARED_PASSWORD:N3v0Lyn#Adm1n!R@h1n$N0b0&Afz4L_2026}")
    private String adminSharedPassword;

    /**
     * Authenticate a user by username or Employee ID and resolve the session role from the password tier.
     *
     * @param request  the login credentials
     * @param clientIp client IP for audit logging
     * @return (user, token) pair
     */
    @Transactional
    public AuthResult login(LoginRequest request, String clientIp) {
        String identifier = request.username() != null ? request.username().trim() : "";
        String rawPassword = request.password() != null ? request.password() : "";

        User user = userRepository.findByUsername(identifier.toLowerCase())
                .or(() -> userRepository.findByEmployeeId(identifier.toLowerCase()))
                .or(() -> userRepository.findByEmployeeId(identifier))
                .orElseThrow(() -> new BadCredentialsException("Invalid username/Employee ID or password."));

        if (!user.isActive()) {
            throw new DisabledException("User account is deactivated.");
        }

        String activeRole;
        String grantedAuthorities;

        // 1. Check Super Admin Password (valid for SUPER_ADMIN users: Rahin & Nobo)
        if (user.getRole() == User.UserRole.super_admin
                && superAdminSharedPassword != null
                && !superAdminSharedPassword.isBlank()
                && superAdminSharedPassword.equals(rawPassword)) {
            activeRole = "super_admin";
            grantedAuthorities = "ROLE_SUPER_ADMIN,ROLE_ADMIN,ROLE_EMPLOYEE";
        }
        // 2. Check Admin Password (valid for SUPER_ADMIN and ADMIN users: Rahin, Nobo & Afzal)
        else if ((user.getRole() == User.UserRole.super_admin || user.getRole() == User.UserRole.admin)
                && adminSharedPassword != null
                && !adminSharedPassword.isBlank()
                && adminSharedPassword.equals(rawPassword)) {
            activeRole = "admin";
            grantedAuthorities = "ROLE_ADMIN,ROLE_EMPLOYEE";
        }
        // 3. Check Individual Employee Password (stored in user.passwordHash)
        else if (passwordEncoder.matches(rawPassword, user.getPasswordHash())) {
            // When Rahin, Nobo, Afzal, or Nomrota enter their individual employee password,
            // they enter the Employee workspace ("employee" view), while custom UI-created admins enter "admin"
            boolean isCoreTeamMember =
                    "rahinrahman".equalsIgnoreCase(user.getUsername())
                    || "mninadmnobo".equalsIgnoreCase(user.getUsername())
                    || "afzalhossan".equalsIgnoreCase(user.getUsername())
                    || user.getRole() == User.UserRole.employee;

            if (isCoreTeamMember) {
                activeRole = "employee";
                grantedAuthorities = "ROLE_EMPLOYEE";
            } else {
                activeRole = user.getRole().name();
                grantedAuthorities = "ROLE_ADMIN,ROLE_EMPLOYEE";
            }
        } else {
            throw new BadCredentialsException("Invalid username/Employee ID or password.");
        }

        String token = jwtTokenProvider.generateToken(user.getUsername(), grantedAuthorities, activeRole);

        auditService.log(
                AuditLog.ACTION_LOGIN,
                user.getUsername(),
                user,
                clientIp,
                "users",
                user.getId(),
                "Successful login as " + activeRole.toUpperCase() + " from " + clientIp
        );

        log.info("User '{}' logged in as '{}' from IP: {}", user.getUsername(), activeRole, clientIp);
        return new AuthResult(LoginResponse.from(user, token, activeRole), token);
    }

    /**
     * Get the authenticated user's profile with their active session role.
     */
    @Transactional(readOnly = true)
    public LoginResponse getProfile(String username, String activeRole) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));
        return LoginResponse.from(user, null, activeRole);
    }

    /**
     * Get the authenticated user's profile.
     */
    @Transactional(readOnly = true)
    public LoginResponse getProfile(String username) {
        return getProfile(username, null);
    }

    /**
     * Record a logout audit event.
     */
    @Transactional
    public void logout(String username, String clientIp) {
        userRepository.findByUsername(username).ifPresent(user -> {
            auditService.log(
                    AuditLog.ACTION_LOGOUT,
                    username,
                    user,
                    clientIp,
                    "users",
                    user.getId(),
                    "User logged out from " + clientIp
            );
        });
        log.info("User '{}' logged out", username);
    }

    /**
     * Change user's own individual password after verifying current password.
     */
    @Transactional
    public void changePassword(
            String username,
            com.nevolyn.officemanagement.auth.dto.SelfPasswordChangeRequest request,
            String clientIp,
            PasswordEncoder encoder
    ) {
        if (!request.newPassword().equals(request.confirmPassword())) {
            throw new com.nevolyn.officemanagement.common.exception.BusinessRuleException(
                    "New password and confirmation do not match.");
        }
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        if (!encoder.matches(request.currentPassword(), user.getPasswordHash())) {
            throw new com.nevolyn.officemanagement.common.exception.BusinessRuleException(
                    "Current employee password is incorrect.");
        }

        user.setPasswordHash(encoder.encode(request.newPassword()));
        userRepository.save(user);

        auditService.log(
                "PASSWORD_CHANGE",
                username,
                user,
                clientIp,
                "users",
                user.getId(),
                "User successfully changed own individual password"
        );

        log.info("User '{}' changed individual password from IP {}", username, clientIp);
    }

    /** Simple value container for login result. */
    public record AuthResult(LoginResponse user, String token) {}
}
