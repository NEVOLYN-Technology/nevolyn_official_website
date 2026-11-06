package com.nevolyn.officemanagement.security.config;

import com.nevolyn.officemanagement.security.jwt.JwtAuthenticationFilter;
import com.nevolyn.officemanagement.security.network.NetworkAccessFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

/**
 * Spring Security configuration.
 *
 * <p>Security chain:
 * <ol>
 *   <li>{@link JwtAuthenticationFilter} — reads JWT from cookie or header, sets SecurityContext</li>
 *   <li>{@link NetworkAccessFilter} — enforces IP-based access rules for employees</li>
 *   <li>Spring Security authorization — endpoint-level rules + {@code @PreAuthorize}</li>
 * </ol>
 *
 * <p>Session management is STATELESS — no server-side HTTP sessions.
 * Authentication state lives entirely in the JWT cookie.
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final NetworkAccessFilter networkAccessFilter;
    private final UserDetailsService userDetailsService;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
                // Apply CORS configuration from CorsConfigurationSource
                .cors(Customizer.withDefaults())

                // Disable CSRF — we use stateless JWT (CSRF not applicable to cookie-based JWT
                // when using SameSite=Strict/Lax cookies and proper CORS)
                .csrf(AbstractHttpConfigurer::disable)

                // Stateless sessions
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // Return 401 JSON (not a redirect) for unauthenticated requests
                .exceptionHandling(ex ->
                        ex.authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED)))

                // Authorization rules
                .authorizeHttpRequests(auth -> auth
                        // Public endpoints
                        .requestMatchers(HttpMethod.POST, "/api/v1/auth/login").permitAll()
                        .requestMatchers("/actuator/health", "/actuator/info").permitAll()
                        .requestMatchers("/swagger-ui/**", "/swagger-ui.html", "/api-docs/**", "/v3/api-docs/**").permitAll()

                        // SUPER_ADMIN-only: administrator account management
                        .requestMatchers("/api/v1/users/admins/**").hasRole("SUPER_ADMIN")

                        // ADMIN+ endpoints (ADMIN and SUPER_ADMIN both have ROLE_ADMIN)
                        .requestMatchers("/api/v1/users/**").hasRole("ADMIN")
                        .requestMatchers("/api/v1/reports/**").hasRole("ADMIN")
                        .requestMatchers("/api/v1/audit/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/v1/projects").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/projects/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/v1/tasks").hasRole("ADMIN")

                        // All other API endpoints require authentication (method-level security handles fine-grained access)
                        .requestMatchers("/api/**").authenticated()

                        // Everything else (static, etc.)
                        .anyRequest().permitAll()
                )

                // Add JWT filter before Spring's username/password filter
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)

                // Add network filter after JWT filter (so role is available for network check)
                .addFilterAfter(networkAccessFilter, JwtAuthenticationFilter.class)

                .build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        // BCrypt strength 12 — secure and standard
        return new BCryptPasswordEncoder(12);
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}
