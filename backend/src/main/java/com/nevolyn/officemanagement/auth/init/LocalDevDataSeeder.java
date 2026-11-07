package com.nevolyn.officemanagement.auth.init;

import com.nevolyn.officemanagement.user.dto.CreateUserRequest;
import com.nevolyn.officemanagement.user.entity.User;
import com.nevolyn.officemanagement.user.repository.UserRepository;
import com.nevolyn.officemanagement.user.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
@Order(20)
public class LocalDevDataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(LocalDevDataSeeder.class);

    private final UserRepository userRepository;
    private final UserService userService;
    private final Environment environment;

    public LocalDevDataSeeder(UserRepository userRepository, UserService userService, Environment environment) {
        this.userRepository = userRepository;
        this.userService = userService;
        this.environment = environment;
    }

    @Override
    public void run(String... args) {
        String url = environment.getProperty("spring.datasource.url", "");
        if (!url.startsWith("jdbc:h2:")) {
            return;
        }

        seed("nev_rahinrahman_2026-01-15", "rahinrahman", "rahin123", "Md Rahinur Rahman",
                "Founder & AI Systems Engineer", "2026-01-15", "rahin.rahman11@gmail.com", User.UserRole.super_admin);
        seed("nev_mninadmnobo_2026-07-01", "mninadmnobo", "nobo123", "Mohammad Ninad Mahmud Nobo",
                "Co-Founder & AI Software Engineer", "2026-07-01", "mninadmnobo@gmail.com", User.UserRole.super_admin);
        seed("nev_afzalhossan_2026-11-01", "afzalhossan", "afzal123", "Afzal Hossan",
                "AI Software Engineer", "2026-11-01", "afzalhossan80@gmail.com", User.UserRole.admin);
        seed("nev_nomrota_2026-11-01", "nomrota", "nomrota123", "Mobashira Mehajabin Nomrota",
                "Innovation and Systems Engineer", "2026-11-01", "mehzabinmobashira@gmail.com", User.UserRole.employee);
    }

    private void seed(String employeeId, String username, String employeePassword, String fullName,
                      String designation, String joiningDate, String email, User.UserRole role) {
        if (userRepository.findByUsername(username).isPresent()) {
            return;
        }
        try {
            CreateUserRequest request = new CreateUserRequest(
                    employeeId, username, employeePassword, fullName, designation,
                    LocalDate.parse(joiningDate), null, email, null, fullName, null, null, null, role.name());
            if (role == User.UserRole.super_admin) {
                userService.createSuperAdmin(request, "127.0.0.1", "LOCAL_SEED");
            } else {
                userService.createUser(request, "127.0.0.1", "LOCAL_SEED", User.UserRole.super_admin);
            }
            log.info("[LOCAL-SEED] Created {} ({}).", username, role);
        } catch (Exception e) {
            log.error("[LOCAL-SEED] Failed to create {}: {}", username, e.getMessage());
        }
    }
}

