package com.nevolyn.officemanagement.auth.init;

import com.nevolyn.officemanagement.user.dto.CreateUserRequest;
import com.nevolyn.officemanagement.user.entity.User;
import com.nevolyn.officemanagement.user.repository.UserRepository;
import com.nevolyn.officemanagement.user.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

// Environment-driven bootstrap initializer for NEVOLYN Office Management accounts.
// Optional bootstrap slots are provisioned only when their corresponding environment
// variables are explicitly provided in .env.
@Component
@Order(10)
public class AdminAccountInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminAccountInitializer.class);

    private final UserRepository userRepository;
    private final UserService userService;

    public AdminAccountInitializer(
            UserRepository userRepository,
            UserService userService) {
        this.userRepository = userRepository;
        this.userService = userService;
    }

    @Value("${SUPER_ADMIN_1_USERNAME:}")
    private String superAdmin1Username;

    @Value("${SUPER_ADMIN_1_FULL_NAME:}")
    private String superAdmin1FullName;

    @Value("${SUPER_ADMIN_1_EMPLOYEE_ID:}")
    private String superAdmin1EmployeeId;

    @Value("${SUPER_ADMIN_1_DESIGNATION:}")
    private String superAdmin1Designation;

    @Value("${SUPER_ADMIN_1_JOINING_DATE:}")
    private String superAdmin1JoiningDate;

    @Value("${SUPER_ADMIN_1_EMAIL:}")
    private String superAdmin1Email;

    @Value("${SUPER_ADMIN_2_USERNAME:}")
    private String superAdmin2Username;

    @Value("${SUPER_ADMIN_2_FULL_NAME:}")
    private String superAdmin2FullName;

    @Value("${SUPER_ADMIN_2_EMPLOYEE_ID:}")
    private String superAdmin2EmployeeId;

    @Value("${SUPER_ADMIN_2_DESIGNATION:}")
    private String superAdmin2Designation;

    @Value("${SUPER_ADMIN_2_JOINING_DATE:}")
    private String superAdmin2JoiningDate;

    @Value("${SUPER_ADMIN_2_EMAIL:}")
    private String superAdmin2Email;

    @Value("${ADMIN_3_USERNAME:}")
    private String admin3Username;

    @Value("${ADMIN_3_FULL_NAME:}")
    private String admin3FullName;

    @Value("${ADMIN_3_EMPLOYEE_ID:}")
    private String admin3EmployeeId;

    @Value("${ADMIN_3_DESIGNATION:}")
    private String admin3Designation;

    @Value("${ADMIN_3_JOINING_DATE:}")
    private String admin3JoiningDate;

    @Value("${ADMIN_3_EMAIL:}")
    private String admin3Email;

    @Override
    public void run(String... args) {
        provisionAccountIfConfigured(
                1,
                superAdmin1EmployeeId,
                superAdmin1Username,
                superAdmin1FullName,
                superAdmin1Designation,
                superAdmin1JoiningDate,
                superAdmin1Email,
                User.UserRole.super_admin);

        provisionAccountIfConfigured(
                2,
                superAdmin2EmployeeId,
                superAdmin2Username,
                superAdmin2FullName,
                superAdmin2Designation,
                superAdmin2JoiningDate,
                superAdmin2Email,
                User.UserRole.super_admin);

        provisionAccountIfConfigured(
                3,
                admin3EmployeeId,
                admin3Username,
                admin3FullName,
                admin3Designation,
                admin3JoiningDate,
                admin3Email,
                User.UserRole.admin);
    }

    private void provisionAccountIfConfigured(
            int slot,
            String employeeId,
            String username,
            String fullName,
            String designation,
            String joiningDateStr,
            String email,
            User.UserRole targetRole) {
        String cleanUser = clean(username);
        String cleanEmpId = clean(employeeId);
        if (cleanUser.isEmpty() || cleanEmpId.isEmpty()) {
            return;
        }

        String normalizedUsername = cleanUser.toLowerCase();
        String normalizedEmployeeId = cleanEmpId.toLowerCase();
        String cleanFullName = clean(fullName);
        String cleanDesignation = clean(designation);
        String cleanEmail = clean(email);
        LocalDate joiningDate = parseJoiningDate(clean(joiningDateStr));

        var existingOpt = userRepository.findByUsername(normalizedUsername)
                .or(() -> userRepository.findByEmployeeId(normalizedEmployeeId));

        if (existingOpt.isPresent()) {
            User existing = existingOpt.get();
            existing.setUsername(normalizedUsername);
            existing.setEmployeeId(normalizedEmployeeId);
            existing.setRole(targetRole);
            existing.setIsActive(true);
            if (joiningDate != null) {
                existing.setJoiningDate(joiningDate);
            }
            if (!cleanFullName.isEmpty()) {
                existing.setFullName(cleanFullName);
                if (existing.getBankAccountName() == null || existing.getBankAccountName().isBlank()) {
                    existing.setBankAccountName(cleanFullName);
                }
            }
            if (!cleanDesignation.isEmpty()) {
                existing.setDesignation(cleanDesignation);
            }
            if ((existing.getEmail() == null || existing.getEmail().isBlank()) && !cleanEmail.isEmpty()) {
                existing.setEmail(cleanEmail);
            }
            userRepository.save(existing);
            log.info("[BOOTSTRAP] Slot {} ('{}' / '{}' - {}) synchronized.",
                    slot, normalizedUsername, normalizedEmployeeId, targetRole);
            return;
        }

        String initialPassword = java.util.UUID.randomUUID().toString();
        String resolvedFullName = !cleanFullName.isEmpty() ? cleanFullName : normalizedUsername;
        String resolvedDesignation = !cleanDesignation.isEmpty() ? cleanDesignation : null;

        try {
            CreateUserRequest request = new CreateUserRequest(
                    normalizedEmployeeId,
                    normalizedUsername,
                    initialPassword,
                    resolvedFullName,
                    resolvedDesignation,
                    joiningDate,
                    null,
                    !cleanEmail.isEmpty() ? cleanEmail : null,
                    null,
                    resolvedFullName,
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

    private LocalDate parseJoiningDate(String rawDate) {
        if (rawDate == null || rawDate.isBlank()) {
            return null;
        }
        try {
            return LocalDate.parse(rawDate.trim());
        } catch (Exception ignored) {
            return null;
        }
    }

    private static String clean(String value) {
        if (value == null) {
            return "";
        }
        String trimmed = value.trim();
        if (trimmed.length() >= 2
                && ((trimmed.startsWith("'") && trimmed.endsWith("'"))
                || (trimmed.startsWith("\"") && trimmed.endsWith("\"")))) {
            return trimmed.substring(1, trimmed.length() - 1).trim();
        }
        return trimmed;
    }
}
