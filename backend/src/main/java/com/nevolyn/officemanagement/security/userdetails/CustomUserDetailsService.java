package com.nevolyn.officemanagement.security.userdetails;

import com.nevolyn.officemanagement.user.entity.User;
import com.nevolyn.officemanagement.user.repository.UserRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        String identifier = username != null ? username.trim() : "";

        Optional<User> dbUser = userRepository.findByUsername(identifier.toLowerCase())
                .or(() -> userRepository.findByEmployeeId(identifier.toLowerCase()))
                .or(() -> userRepository.findByEmployeeId(identifier));

        if (dbUser.isEmpty()) {
            throw new UsernameNotFoundException("User not found with identifier: " + username);
        }

        User user = dbUser.get();
        List<SimpleGrantedAuthority> authorities = resolveAuthorities(user.getRole());

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

    private List<SimpleGrantedAuthority> resolveAuthorities(User.UserRole role) {
        if (role == User.UserRole.super_admin) {
            return List.of(
                    new SimpleGrantedAuthority("ROLE_SUPER_ADMIN"),
                    new SimpleGrantedAuthority("ROLE_ADMIN"),
                    new SimpleGrantedAuthority("ROLE_EMPLOYEE")
            );
        }
        if (role == User.UserRole.admin) {
            return List.of(
                    new SimpleGrantedAuthority("ROLE_ADMIN"),
                    new SimpleGrantedAuthority("ROLE_EMPLOYEE")
            );
        }
        return List.of(new SimpleGrantedAuthority("ROLE_EMPLOYEE"));
    }
}
