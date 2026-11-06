package com.nevolyn.officemanagement.security.userdetails;

import com.nevolyn.officemanagement.user.entity.User;
import com.nevolyn.officemanagement.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Spring Security UserDetailsService implementation.
 *
 * <p>Loads user from database by username or employeeId and maps role to
 * Spring Security authorities: {@code ROLE_SUPER_ADMIN}, {@code ROLE_ADMIN}, and {@code ROLE_EMPLOYEE}.
 */
@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        String identifier = username != null ? username.trim() : "";
        User user = userRepository.findByUsername(identifier.toLowerCase())
                .or(() -> userRepository.findByEmployeeId(identifier.toLowerCase()))
                .or(() -> userRepository.findByEmployeeId(identifier))
                .orElseThrow(() -> new UsernameNotFoundException(
                        "User not found with identifier: " + username));

        /*
         * Authority mapping (three-tier RBAC with full Employee workspace inheritance):
         *
         *  super_admin  →  ROLE_SUPER_ADMIN + ROLE_ADMIN + ROLE_EMPLOYEE
         *  admin        →  ROLE_ADMIN + ROLE_EMPLOYEE
         *  employee     →  ROLE_EMPLOYEE
         *
         * Because Rahin, Ninad, and Afzal are both Administrators/Founders AND active
         * R&D Engineers, granting ROLE_EMPLOYEE alongside their administrative role
         * allows a single unified username and Employee ID (nev_<username>_<joiningDate>)
         * to seamlessly use both Admin and Employee features.
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
}
