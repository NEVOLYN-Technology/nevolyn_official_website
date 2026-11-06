package com.nevolyn.officemanagement.user.controller;

import com.nevolyn.officemanagement.common.util.IpUtils;
import com.nevolyn.officemanagement.user.dto.CreateUserRequest;
import com.nevolyn.officemanagement.user.dto.ResetPasswordRequest;
import com.nevolyn.officemanagement.user.dto.UpdateUserRequest;
import com.nevolyn.officemanagement.user.dto.UserDto;
import com.nevolyn.officemanagement.user.entity.User;
import com.nevolyn.officemanagement.user.repository.UserRepository;
import com.nevolyn.officemanagement.user.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;


/**
 * Staff directory, user account lifecycle, and role management controller.
 *
 * <p>All mutating endpoints pass the caller's resolved {@link User.UserRole} to the service layer,
 * which enforces fine-grained privilege rules independently of the frontend.
 *
 * <p>SUPER_ADMIN accounts are strictly provisioned at the code level via
 * {@link com.nevolyn.officemanagement.auth.init.AdminAccountInitializer} and cannot be created via REST APIs.
 */
@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final UserRepository userRepository;

    // ─────────────────────────────────────────────────────────────
    // SHARED read endpoints (ADMIN and SUPER_ADMIN)
    // ─────────────────────────────────────────────────────────────

    /**
     * Retrieve paginated list of all registered accounts in the system.
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<UserDto>> getAllUsers(@PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(userService.getAllUsers(pageable));
    }

    /**
     * Retrieve all active non-admin employees (used to populate task/project delegation dropdowns).
     */
    @GetMapping("/employees")
    public ResponseEntity<List<UserDto>> getActiveEmployees() {
        return ResponseEntity.ok(userService.getActiveEmployees());
    }

    /**
     * Retrieve a specific user account profile by primary key.
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDto> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    // ─────────────────────────────────────────────────────────────
    // EMPLOYEE/ADMIN provisioning (ADMIN and SUPER_ADMIN)
    // Service layer enforces: ADMIN → employee only; SUPER_ADMIN → admin or employee
    // SUPER_ADMIN accounts are strictly code-level only (AdminAccountInitializer)
    // ─────────────────────────────────────────────────────────────

    /**
     * Provision a new staff or administrator account.
     *
     * <p>Service-level privilege enforcement:
     * <ul>
     *   <li>ADMIN can only create EMPLOYEE accounts.</li>
     *   <li>SUPER_ADMIN can create ADMIN or EMPLOYEE accounts.</li>
     *   <li>SUPER_ADMIN accounts cannot be created via any REST endpoint (code-level bootstrap only).</li>
     * </ul>
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDto> createUser(
            @Valid @RequestBody CreateUserRequest request,
            HttpServletRequest servletRequest,
            @AuthenticationPrincipal UserDetails caller
    ) {
        String clientIp = IpUtils.extractClientIp(servletRequest);
        User.UserRole callerRole = resolveCallerRole(caller.getUsername());
        UserDto created = userService.createUser(request, clientIp, caller.getUsername(), callerRole);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * Update an existing user's profile details.
     *
     * <p>Service-level privilege enforcement:
     * <ul>
     *   <li>ADMIN cannot edit ADMIN or SUPER_ADMIN accounts.</li>
     *   <li>Promotion to SUPER_ADMIN is rejected by the service.</li>
     *   <li>ADMIN cannot grant ADMIN role to any user.</li>
     * </ul>
     */
    @PatchMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDto> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserRequest request,
            HttpServletRequest servletRequest,
            @AuthenticationPrincipal UserDetails caller
    ) {
        String clientIp = IpUtils.extractClientIp(servletRequest);
        User.UserRole callerRole = resolveCallerRole(caller.getUsername());
        return ResponseEntity.ok(userService.updateUser(id, request, clientIp, caller.getUsername(), callerRole));
    }

    /**
     * Toggle the active status of a user account.
     *
     * <p>Service-level privilege enforcement:
     * <ul>
     *   <li>SUPER_ADMIN accounts cannot be deactivated.</li>
     *   <li>No actor can deactivate their own account.</li>
     *   <li>ADMIN cannot deactivate another ADMIN.</li>
     * </ul>
     */
    @PatchMapping("/{id}/toggle-status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDto> toggleUserStatus(
            @PathVariable Long id,
            HttpServletRequest servletRequest,
            @AuthenticationPrincipal UserDetails caller
    ) {
        String clientIp = IpUtils.extractClientIp(servletRequest);
        User.UserRole callerRole = resolveCallerRole(caller.getUsername());
        return ResponseEntity.ok(userService.toggleUserStatus(id, clientIp, caller.getUsername(), callerRole));
    }

    /**
     * Perform an audited administrative password reset for a staff account.
     *
     * <p>Service-level privilege enforcement:
     * <ul>
     *   <li>SUPER_ADMIN passwords cannot be reset via this endpoint.</li>
     *   <li>ADMIN cannot reset another ADMIN's password.</li>
     * </ul>
     */
    @PatchMapping("/{id}/reset-password")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> resetPassword(
            @PathVariable Long id,
            @Valid @RequestBody ResetPasswordRequest request,
            HttpServletRequest servletRequest,
            @AuthenticationPrincipal UserDetails caller
    ) {
        String clientIp = IpUtils.extractClientIp(servletRequest);
        User.UserRole callerRole = resolveCallerRole(caller.getUsername());
        userService.resetPassword(id, request, clientIp, caller.getUsername(), callerRole);
        return ResponseEntity.noContent().build();
    }

    // ─────────────────────────────────────────────────────────────
    // Internal helper
    // ─────────────────────────────────────────────────────────────

    private User.UserRole resolveCallerRole(String username) {
        org.springframework.security.core.Authentication auth =
                org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getAuthorities() != null) {
            boolean hasSuperAdmin = auth.getAuthorities().stream()
                    .anyMatch(a -> "ROLE_SUPER_ADMIN".equals(a.getAuthority()));
            if (hasSuperAdmin) {
                return User.UserRole.super_admin;
            }
            boolean hasAdmin = auth.getAuthorities().stream()
                    .anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));
            if (hasAdmin) {
                return User.UserRole.admin;
            }
        }
        return userRepository.findByUsername(username)
                .map(User::getRole)
                .orElseThrow(() -> new com.nevolyn.officemanagement.common.exception.ResourceNotFoundException(
                        "User", "username", username));
    }
}
