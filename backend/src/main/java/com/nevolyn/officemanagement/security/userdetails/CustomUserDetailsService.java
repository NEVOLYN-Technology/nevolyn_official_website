package com.nevolyn.officemanagement.security.userdetails;

import com.nevolyn.officemanagement.user.entity.User;
import com.nevolyn.officemanagement.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * Spring Security UserDetailsService implementation.
 *
 * <p>Loads user from database by username or employeeId and maps role to
 * Spring Security authorities: {@code ROLE_SUPER_ADMIN}, {@code ROLE_ADMIN}, and {@code ROLE_EMPLOYEE}.
 * Also supports the configured HTTP Basic administrator account for the website's
 * {@code /admin} Operations Dashboard.
 */
@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${NEVOLYN_ADMIN_USERNAME:${ADMIN_USERNAME:${app.admin.username:admin}}}")
    private String adminUsername;

    @Value("${NEVOLYN_ADMIN_PASSWORD:${ADMIN_PASSWORD:${app.admin.password:}}}")
    private String adminPassword;

    public CustomUserDetailsService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        String identifier = username != null ? username.trim() : "";

        Optional<User> dbUser = userRepository.findByUsername(identifier.toLowerCase())
                .or(() -> userRepository.findByEmployeeId(identifier.toLowerCase()))
                .or(() -> userRepository.findByEmployeeId(identifier));

        if (dbUser.isPresent()) {
            User user = dbUser.get();

            /*
             * Authority mapping (three-tier RBAC with full Employee workspace inheritance):
             *
             *  super_admin  →  ROLE_SUPER_ADMIN + ROLE_ADMIN + ROLE_EMPLOYEE
             *  admin        →  ROLE_ADMIN + ROLE_EMPLOYEE
             *  employee     →  ROLE_EMPLOYEE
             */
            List<SimpleGrantedAuthority> authorities;
            if (user.getRole() == User.UserRole.super_admin) {
                authorities = List.of(
                        new SimpleGrantedAuthority("ROLE_SUPER_ADMIN"),
                        new SimpleGrantedAuthority("ROLE_ADMIN"),
                        new SimpleGrantedAuthority("ROLE_EMPLOYEE")
                );
            } else if (user.getRole() == User.UserRole.admin) {
                authorities = List.of(
                        new SimpleGrantedAuthority("ROLE_ADMIN"),
                        new SimpleGrantedAuthority("ROLE_EMPLOYEE")
                );
            } else {
                authorities = List.of(new SimpleGrantedAuthority("ROLE_EMPLOYEE"));
            }

            return org.springframework.security.core.userdetails.User.builder()
                    .username(user.getUsername())
                    .password(user.getPasswordHash())
                    .authorities(authorities)
                    .disabled(!user.isActive())
                    .accountExpired(false)
                    .credentialsExpired(false)
                    .accountLocked(false)
                    .build();
        }

        // Fallback to HTTP Basic admin user for the website /admin Operations Dashboard
        String configuredUsername = (adminUsername != null && !adminUsername.isBlank()) ? adminUsername.trim() : "admin";
        if (identifier.equals(configuredUsername)) {
            if (adminPassword == null || adminPassword.isBlank()) {
                throw new UsernameNotFoundException("Website administrator account is not configured in environment.");
            }
            String rawPassword = adminPassword.trim();
            if ((rawPassword.startsWith("'") && rawPassword.endsWith("'"))
                    || (rawPassword.startsWith("\"") && rawPassword.endsWith("\""))) {
                rawPassword = rawPassword.substring(1, rawPassword.length() - 1);
            }
            return org.springframework.security.core.userdetails.User.withUsername(configuredUsername)
                    .password(passwordEncoder.encode(rawPassword))
                    .roles("ADMIN")
                    .build();
        }

        throw new UsernameNotFoundException("User not found with identifier: " + username);
    }
}
