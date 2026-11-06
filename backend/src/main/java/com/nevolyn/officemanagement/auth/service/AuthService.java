package com.nevolyn.officemanagement.auth.service;

import com.nevolyn.officemanagement.audit.entity.AuditLog;
import com.nevolyn.officemanagement.audit.service.AuditService;
import com.nevolyn.officemanagement.auth.dto.LoginRequest;
import com.nevolyn.officemanagement.auth.dto.LoginResponse;
import com.nevolyn.officemanagement.common.exception.ResourceNotFoundException;
import com.nevolyn.officemanagement.security.jwt.JwtTokenProvider;
import com.nevolyn.officemanagement.user.entity.User;
import com.nevolyn.officemanagement.user.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

// Authentication business logic supporting role-tiered password login.
@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final JwtTokenProvider jwtTokenProvider;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditService auditService;

    @Value("${SUPER_ADMIN_SHARED_PASSWORD:}")
    private String superAdminSharedPassword;

    @Value("${ADMIN_SHARED_PASSWORD:}")
    private String adminSharedPassword;

    public AuthService(
            JwtTokenProvider jwtTokenProvider,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            AuditService auditService
    ) {
        this.jwtTokenProvider = jwtTokenProvider;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.auditService = auditService;
    }

    // Authenticate a user by username or Employee ID and resolve the session role from the password tier.
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

        // 1. Check Super Admin Password (valid for SUPER_ADMIN users)
        if (user.getRole() == User.UserRole.super_admin
                && matchesSharedTierPassword(superAdminSharedPassword, rawPassword)) {
            activeRole = "super_admin";
            grantedAuthorities = "ROLE_SUPER_ADMIN,ROLE_ADMIN,ROLE_EMPLOYEE";
        }
        // 2. Check Admin Password (valid for SUPER_ADMIN and ADMIN users)
        else if ((user.getRole() == User.UserRole.super_admin || user.getRole() == User.UserRole.admin)
                && matchesSharedTierPassword(adminSharedPassword, rawPassword)) {
            activeRole = "admin";
            grantedAuthorities = "ROLE_ADMIN,ROLE_EMPLOYEE";
        }
        // 3. Check Individual Employee Password (stored in user.passwordHash in database)
        else if (matchesEmployeePassword(user, rawPassword)) {
            boolean roleTiersConfigured =
                    (superAdminSharedPassword != null && !superAdminSharedPassword.isBlank())
                    || (adminSharedPassword != null && !adminSharedPassword.isBlank());

            if (roleTiersConfigured || user.getRole() == User.UserRole.employee) {
                activeRole = "employee";
                grantedAuthorities = "ROLE_EMPLOYEE";
            } else if (user.getRole() == User.UserRole.super_admin) {
                activeRole = "super_admin";
                grantedAuthorities = "ROLE_SUPER_ADMIN,ROLE_ADMIN,ROLE_EMPLOYEE";
            } else {
                activeRole = "admin";
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

    // Get the authenticated user's profile with their active session role.
    @Transactional(readOnly = true)
    public LoginResponse getProfile(String username, String activeRole) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));
        return LoginResponse.from(user, null, activeRole);
    }

    // Get the authenticated user's profile.
    @Transactional(readOnly = true)
    public LoginResponse getProfile(String username) {
        return getProfile(username, null);
    }

    // Record a logout audit event.
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

    // Change user's own individual password after verifying current password.
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

        if (!matchesEmployeePassword(user, request.currentPassword())) {
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

    private boolean matchesSharedTierPassword(
            String configuredSecret,
            String rawPassword
    ) {
        if (rawPassword == null || rawPassword.isBlank() || configuredSecret == null || configuredSecret.isBlank()) {
            return false;
        }
        String trimmedInput = rawPassword.trim();
        String cleanSecret = stripQuotes(configuredSecret.trim());
        if (cleanSecret.isEmpty()) {
            return false;
        }
        if (constantTimeEquals(cleanSecret, rawPassword) || constantTimeEquals(cleanSecret, trimmedInput)) {
            return true;
        }
        String unescapedSecret = cleanSecret.replace("$$", "$");
        return constantTimeEquals(unescapedSecret, rawPassword) || constantTimeEquals(unescapedSecret, trimmedInput);
    }

    private boolean matchesEmployeePassword(User user, String rawPassword) {
        if (rawPassword == null || rawPassword.isBlank() || user.getPasswordHash() == null || user.getPasswordHash().isBlank()) {
            return false;
        }
        String trimmedInput = rawPassword.trim();
        return passwordEncoder.matches(rawPassword, user.getPasswordHash())
                || passwordEncoder.matches(trimmedInput, user.getPasswordHash());
    }

    private static String stripQuotes(String value) {
        if (value == null || value.length() < 2) {
            return value != null ? value : "";
        }
        if ((value.startsWith("'") && value.endsWith("'"))
                || (value.startsWith("\"") && value.endsWith("\""))) {
            return value.substring(1, value.length() - 1).trim();
        }
        return value;
    }

    private static boolean constantTimeEquals(String a, String b) {
        if (a == null || b == null) {
            return false;
        }
        return MessageDigest.isEqual(
                a.getBytes(StandardCharsets.UTF_8),
                b.getBytes(StandardCharsets.UTF_8)
        );
    }

    // Simple value container for login result.
    public record AuthResult(LoginResponse user, String token) {}
}
