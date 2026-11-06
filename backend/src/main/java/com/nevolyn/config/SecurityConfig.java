package com.nevolyn.config;

import com.nevolyn.officemanagement.security.jwt.JwtAuthenticationFilter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.ArrayList;
import java.util.List;

/**
 * Unified access control, JWT authentication, HTTP Basic authentication, and CORS rules
 * for both the NEVOLYN official website and the NEVOLYN Office & HRM Portal.
 */
@Slf4j
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    @Value("${NEVOLYN_ADMIN_USERNAME:${ADMIN_USERNAME:${app.admin.username:admin}}}")
    private String adminUsername;

    @Value("${NEVOLYN_ADMIN_PASSWORD:${ADMIN_PASSWORD:${app.admin.password:}}}")
    private String adminPassword;

    @Value("${app.cors.allowed-origins:https://nevolyn.com,https://www.nevolyn.com,http://localhost:3000}")
    private List<String> allowedOrigins;

    @Bean
    public SecurityFilterChain filterChain(
            HttpSecurity http,
            ObjectProvider<JwtAuthenticationFilter> jwtFilterProvider
    ) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Public: CORS preflight requests
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // Public: website contact form and job application form
                        .requestMatchers(HttpMethod.POST, "/api/v1/contact").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/contact/verify").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/v1/applications").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/applications/verify").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/applications/*/pdf").permitAll()

                        // One-click acknowledge links sent in admin notification emails
                        .requestMatchers("/api/v1/acknowledge/**").permitAll()

                        // Public: Office Portal JWT authentication endpoint
                        .requestMatchers("/api/v1/auth/login").permitAll()

                        // Public: static images and assets
                        .requestMatchers("/nevolyn-logo*.png", "/*.png", "/favicon.ico", "/static/**").permitAll()

                        // Public: liveness probe for Docker healthcheck
                        .requestMatchers("/actuator/health", "/actuator/health/**").permitAll()

                        // Dev-only H2 console
                        .requestMatchers("/h2-console/**").permitAll()

                        // Allow authenticated staff to read active employee summary (for project/task assignment dropdowns)
                        .requestMatchers(HttpMethod.GET, "/api/v1/users/employees").authenticated()

                        // Office Super Admin routes (Admin Management)
                        .requestMatchers("/api/v1/users/admins/**").hasRole("SUPER_ADMIN")

                        // Office & Website Admin routes
                        .requestMatchers("/api/v1/users/**").hasRole("ADMIN")
                        .requestMatchers("/api/v1/reports/**").hasRole("ADMIN")
                        .requestMatchers("/api/v1/audit/**").hasRole("ADMIN")
                        .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")

                        // All other Office API endpoints (attendance, projects, tasks, work-logs, training, profile, dashboard)
                        .requestMatchers("/api/v1/**").authenticated()

                        // Everything else requires ADMIN role
                        .anyRequest().hasRole("ADMIN")
                )
                .headers(headers -> headers.frameOptions(frame -> frame.sameOrigin()))
                // Suppress WWW-Authenticate header to prevent native browser "Sign in" popup
                .httpBasic(basic -> basic.authenticationEntryPoint((request, response, authException) -> {
                    response.setStatus(jakarta.servlet.http.HttpServletResponse.SC_UNAUTHORIZED);
                    response.setContentType("application/json");
                    response.getWriter().write("{\"status\":401,\"error\":\"Unauthorized\",\"message\":\"Invalid administrator credentials\"}");
                }));

        JwtAuthenticationFilter jwtAuthenticationFilter = jwtFilterProvider.getIfAvailable();
        if (jwtAuthenticationFilter != null) {
            http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        }

        return http.build();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    @ConditionalOnMissingBean(UserDetailsService.class)
    public UserDetailsService fallbackUserDetailsService(PasswordEncoder passwordEncoder) {
        String username = (adminUsername != null && !adminUsername.isBlank()) ? adminUsername.trim() : "admin";
        String rawPassword;
        if (adminPassword != null && !adminPassword.isBlank()) {
            rawPassword = adminPassword.trim();
            if ((rawPassword.startsWith("'") && rawPassword.endsWith("'")) || (rawPassword.startsWith("\"") && rawPassword.endsWith("\""))) {
                rawPassword = rawPassword.substring(1, rawPassword.length() - 1);
            }
        } else {
            rawPassword = java.util.UUID.randomUUID().toString();
            log.warn("=================================================================");
            log.warn("SECURITY NOTICE: No NEVOLYN_ADMIN_PASSWORD provided in environment.");
            log.warn("Generated temporary fallback admin password: {}", rawPassword);
            log.warn("=================================================================");
        }

        return new InMemoryUserDetailsManager(
                User.withUsername(username)
                        .password(passwordEncoder.encode(rawPassword))
                        .roles("ADMIN")
                        .build()
        );
    }

    @Bean
    public static PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        List<String> origins = new ArrayList<>();
        origins.add("https://nevolyn.com");
        origins.add("https://www.nevolyn.com");
        origins.add("https://*.nevolyn.com");
        origins.add("https://*.vercel.app");
        origins.add("http://localhost:3000");
        origins.add("http://127.0.0.1:3000");

        if (allowedOrigins != null) {
            origins.addAll(allowedOrigins);
        }

        configuration.setAllowedOriginPatterns(origins);
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type", "X-Requested-With", "Accept", "Origin"));
        configuration.setExposedHeaders(List.of("Location", "Authorization"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);

        return source;
    }
}
