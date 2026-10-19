package com.nevolyn.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;

/**
 * HTTP Basic auth security for NEVOLYN Technology REST API.
 *
 * <h2>Access model</h2>
 * <ul>
 *   <li>POST /api/v1/contact and POST /api/v1/applications are public — they
 *       back the public homepage forms.</li>
 *   <li>GET/PATCH/DELETE on those resources require ADMIN role — they expose
 *       visitor PII (name, email, phone, NID) and must not be public.</li>
 *   <li>/api/v1/acknowledge is public — the UUID in the URL acts as the bearer
 *       token for one-click admin email acknowledgement links.</li>
 *   <li>/actuator/health is public for load-balancer probes.</li>
 * </ul>
 *
 * <h2>Why HTTP Basic and not JWT</h2>
 * There is exactly one admin account. Basic auth over HTTPS is the right amount
 * of machinery for this. Swapping to OAuth2 or JWT later means changing only
 * this class.
 *
 * @author NEVOLYN Technology Engineering
 * @version 0.4.0
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final AdminProperties adminProperties;

    public SecurityConfig(AdminProperties adminProperties) {
        this.adminProperties = adminProperties;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // CORS is handled by CorsConfig / CorsConfigurer bean.
                // Spring Security must be told to delegate to the MVC CORS config
                // so that it applies to preflight requests too.
                .cors(Customizer.withDefaults())

                // CSRF is disabled: this is a stateless API authenticated per-request
                // with an Authorization header, not with a session cookie.
                .csrf(csrf -> csrf.disable())

                // No server-side session is created or consulted.
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                .authorizeHttpRequests(auth -> auth
                        // Public: homepage contact form and job application form
                        .requestMatchers(HttpMethod.POST, "/api/v1/contact").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/contact/verify").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/v1/applications").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/applications/verify").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/applications/*/pdf").permitAll()

                        // Public: one-click acknowledge links sent in admin notification emails.
                        // The reference code in the URL is the bearer token.
                        .requestMatchers("/api/v1/acknowledge/**").permitAll()

                        // Public: static assets for emails and favicon
                        .requestMatchers("/nevolyn-logo*.png", "/*.png", "/favicon.ico", "/static/**").permitAll()

                        // Public: liveness probe for load balancers / Docker healthcheck
                        .requestMatchers("/actuator/health/**").permitAll()

                        // Dev-only H2 console; disabled in prod via application-prod.yml
                        .requestMatchers("/h2-console/**").permitAll()

                        // Everything else — admin GET/PATCH/DELETE routes — requires ADMIN role
                        .anyRequest().hasRole("ADMIN")
                )

                // H2 console uses frames — sameOrigin allows it; harmless in prod
                // because the console is disabled there.
                .headers(headers -> headers.frameOptions(frame -> frame.sameOrigin()))

                .httpBasic(Customizer.withDefaults());

        return http.build();
    }

    /**
     * The single admin account, loaded from {@code app.admin.*} configuration.
     *
     * <p>In-memory is appropriate while there is one operator. Replace with a
     * database-backed {@code UserDetailsService} when real user management is needed.
     */
    @Bean
    public UserDetailsService userDetailsService(PasswordEncoder passwordEncoder) {
        return new InMemoryUserDetailsManager(
                User.withUsername(adminProperties.getUsername())
                        .password(passwordEncoder.encode(adminProperties.getPassword()))
                        .roles("ADMIN")
                        .build()
        );
    }

    /**
     * BCrypt hashing — deliberately slow to make offline brute-force impractical.
     * Never store or compare a password in plain text.
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
