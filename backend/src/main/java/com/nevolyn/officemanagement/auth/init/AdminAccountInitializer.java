package com.nevolyn.officemanagement.auth.init;

import com.nevolyn.officemanagement.user.dto.CreateUserRequest;
import com.nevolyn.officemanagement.user.entity.User;
import com.nevolyn.officemanagement.user.repository.UserRepository;
import com.nevolyn.officemanagement.user.service.UserService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

/**
 * Automated bootstrap initializer for NEVOLYN Office Management unified
 * hierarchy.
 *
 * <p>
 * Enforces the standardized Employee ID convention
 * {@code nev_<username>_<joiningDate>}
 * and keeps usernames consistent across the entire system:
 * <ul>
 * <li><b>Md Rahinur Rahman</b>
 * <ul>
 * <li>Username: {@code rahinrahman}</li>
 * <li>Joining Date: {@code 2026-01-15} (15 January 2026)</li>
 * <li>Employee ID: {@code nev_rahinrahman_2026-01-15}</li>
 * <li>Designation: {@code Founder & AI Systems Engineer}</li>
 * <li>Role: {@code SUPER_ADMIN} (inherits {@code ADMIN} &amp; {@code EMPLOYEE}
 * permissions)</li>
 * </ul>
 * </li>
 * <li><b>Mohammad Ninad Mahmud Nobo</b>
 * <ul>
 * <li>Username: {@code mninadmnobo}</li>
 * <li>Joining Date: {@code 2026-07-01} (1 July 2026)</li>
 * <li>Employee ID: {@code nev_mninadmnobo_2026-07-01}</li>
 * <li>Designation: {@code Co-Founder & AI Software Engineer}</li>
 * <li>Role: {@code SUPER_ADMIN} (inherits {@code ADMIN} &amp; {@code EMPLOYEE}
 * permissions)</li>
 * </ul>
 * </li>
 * <li><b>Afzal Hossan</b>
 * <ul>
 * <li>Username: {@code afzalhossan}</li>
 * <li>Joining Date: {@code 2026-11-01} (1 November 2026)</li>
 * <li>Employee ID: {@code nev_afzalhossan_2026-11-01}</li>
 * <li>Designation: {@code AI Software Engineer}</li>
 * <li>Role: {@code ADMIN} (inherits {@code EMPLOYEE} permissions)</li>
 * </ul>
 * </li>
 * <li><b>Mobashira Mehajabin Nomrota</b>
 * <ul>
 * <li>Username: {@code nomrota}</li>
 * <li>Joining Date: {@code 2026-11-01} (1 November 2026)</li>
 * <li>Employee ID: {@code nev_nomrota_2026-11-01}</li>
 * <li>Designation: {@code Innovation and Systems Engineer}</li>
 * <li>Role: {@code EMPLOYEE}</li>
 * </ul>
 * </li>
 * </ul>
 */
@Component
@Order(10)
@Slf4j
public class AdminAccountInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final UserService userService;
    private final PasswordEncoder passwordEncoder;

    public AdminAccountInitializer(
            UserRepository userRepository,
            UserService userService,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
    }

    // ══════════════════════════════════════════════════════════════════════════
    // Shared Role-Tier Passwords (for migration check on existing DB records)
    // ══════════════════════════════════════════════════════════════════════════

    @Value("${SUPER_ADMIN_SHARED_PASSWORD:}")
    private String superAdminSharedPassword;

    @Value("${ADMIN_SHARED_PASSWORD:}")
    private String adminSharedPassword;

    // ══════════════════════════════════════════════════════════════════════════
    // 1. Md Rahinur Rahman (SUPER_ADMIN + ADMIN + EMPLOYEE)
    // ══════════════════════════════════════════════════════════════════════════

    @Value("${SUPER_ADMIN_1_USERNAME:rahinrahman}")
    private String rahinUsername;

    @Value("${SUPER_ADMIN_1_FULL_NAME:Md Rahinur Rahman}")
    private String rahinFullName;

    @Value("${SUPER_ADMIN_1_EMPLOYEE_ID:nev_rahinrahman_2026-01-15}")
    private String rahinEmployeeId;

    @Value("${SUPER_ADMIN_1_DESIGNATION:Founder & AI Systems Engineer}")
    private String rahinDesignation;

    @Value("${SUPER_ADMIN_1_EMAIL:rahin.rahman11@gmail.com}")
    private String rahinEmail;

    // ══════════════════════════════════════════════════════════════════════════
    // 2. Mohammad Ninad Mahmud Nobo (SUPER_ADMIN + ADMIN + EMPLOYEE)
    // ══════════════════════════════════════════════════════════════════════════

    @Value("${SUPER_ADMIN_2_USERNAME:mninadmnobo}")
    private String noboUsername;

    @Value("${SUPER_ADMIN_2_FULL_NAME:Mohammad Ninad Mahmud Nobo}")
    private String noboFullName;

    @Value("${SUPER_ADMIN_2_EMPLOYEE_ID:nev_mninadmnobo_2026-07-01}")
    private String noboEmployeeId;

    @Value("${SUPER_ADMIN_2_DESIGNATION:Co-Founder & AI Software Engineer}")
    private String noboDesignation;

    @Value("${SUPER_ADMIN_2_EMAIL:mninadmnobo@gmail.com}")
    private String noboEmail;

    // ══════════════════════════════════════════════════════════════════════════
    // 3. Afzal Hossan (ADMIN + EMPLOYEE)
    // ══════════════════════════════════════════════════════════════════════════

    @Value("${ADMIN_3_USERNAME:afzalhossan}")
    private String afzalUsername;

    @Value("${ADMIN_3_FULL_NAME:Afzal Hossan}")
    private String afzalFullName;

    @Value("${ADMIN_3_EMPLOYEE_ID:nev_afzalhossan_2026-11-01}")
    private String afzalEmployeeId;

    @Value("${ADMIN_3_DESIGNATION:AI Software Engineer}")
    private String afzalDesignation;

    @Value("${ADMIN_3_EMAIL:afzalhossan80@gmail.com}")
    private String afzalEmail;

    @Override
    public void run(String... args) {
        log.info("Bootstrapping NEVOLYN unified personnel accounts (nev_<username>_<joiningDate>)...");

        // 1. Rahin — 15 January 2026 — SUPER_ADMIN (logs in as Super Admin, Admin, or
        // Employee)
        provisionAccount(
                1,
                rahinEmployeeId,
                rahinUsername,
                rahinFullName,
                rahinDesignation,
                LocalDate.of(2026, 1, 15),
                rahinEmail,
                User.UserRole.super_admin);

        // 2. Nobo — 1 July 2026 — SUPER_ADMIN (logs in as Super Admin, Admin, or
        // Employee)
        provisionAccount(
                2,
                noboEmployeeId,
                noboUsername,
                noboFullName,
                noboDesignation,
                LocalDate.of(2026, 7, 1),
                noboEmail,
                User.UserRole.super_admin);

        // 3. Afzal — 1 November 2026 — ADMIN (logs in as Admin or Employee)
        provisionAccount(
                3,
                afzalEmployeeId,
                afzalUsername,
                afzalFullName,
                afzalDesignation,
                LocalDate.of(2026, 11, 1),
                afzalEmail,
                User.UserRole.admin);

        // 4. Nomrota — 1 November 2026 — EMPLOYEE (logs in as Employee)
        provisionAccount(
                4,
                "nev_nomrota_2026-11-01",
                "nomrota",
                "Mobashira Mehajabin Nomrota",
                "Innovation and Systems Engineer",
                LocalDate.of(2026, 11, 1),
                "mehzabinmobashira@gmail.com",
                User.UserRole.employee);
    }

    private void provisionAccount(
            int slot,
            String employeeId,
            String username,
            String fullName,
            String designation,
            LocalDate joiningDate,
            String email,
            User.UserRole targetRole) {
        String normalizedUsername = username.trim().toLowerCase();
        String normalizedEmployeeId = employeeId.trim().toLowerCase();

        var existingOpt = userRepository.findByUsername(normalizedUsername)
                .or(() -> userRepository.findByEmployeeId(normalizedEmployeeId));

        if (existingOpt.isPresent()) {
            User existing = existingOpt.get();
            existing.setUsername(normalizedUsername);
            existing.setEmployeeId(normalizedEmployeeId);
            existing.setRole(targetRole);
            existing.setIsActive(true);
            existing.setJoiningDate(joiningDate);

            if (fullName != null && !fullName.isBlank()) {
                existing.setFullName(fullName.trim());
                if (existing.getBankAccountName() == null || existing.getBankAccountName().isBlank()) {
                    existing.setBankAccountName(fullName.trim());
                }
            }
            if (designation != null && !designation.isBlank()) {
                existing.setDesignation(designation.trim());
            }
            if ((existing.getEmail() == null || existing.getEmail().isBlank()) && email != null && !email.isBlank()) {
                existing.setEmail(email.trim());
            }
            userRepository.save(existing);
            log.info("[BOOTSTRAP] Slot {} ('{}' / '{}' - {}) synchronized.",
                    slot, normalizedUsername, normalizedEmployeeId, targetRole);
            return;
        }

        // Initial placeholder password for newly created account; employee sets
        // personal password in /office/profile
        String initialPassword = java.util.UUID.randomUUID().toString();

        try {
            CreateUserRequest request = new CreateUserRequest(
                    normalizedEmployeeId,
                    normalizedUsername,
                    initialPassword,
                    fullName.trim(),
                    designation.trim(),
                    joiningDate,
                    null,
                    email != null ? email.trim() : null,
                    null,
                    fullName.trim(),
                    null,
                    null,
                    null,
                    targetRole.name());

            if (targetRole == User.UserRole.super_admin) {
                userService.createSuperAdmin(request, "127.0.0.1", "SYSTEM_BOOTSTRAP");
            } else {
                userService.createUser(request, "127.0.0.1", "SYSTEM_BOOTSTRAP", User.UserRole.super_admin);
            }

            log.info("[BOOTSTRAP] Slot {} ('{}' / '{}' - {}) provisioned successfully.",
                    slot, normalizedUsername, normalizedEmployeeId, targetRole);
        } catch (Exception e) {
            log.error("Failed to provision slot {} ('{}'): {}", slot, normalizedUsername, e.getMessage());
        }
    }
}
