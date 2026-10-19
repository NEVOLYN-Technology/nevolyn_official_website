package com.nevolyn.config;

import org.springframework.beans.factory.annotation.Value;
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
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.ArrayList;
import java.util.List;

/**
 * Access control and CORS rules, mirroring the architecture in Fabins.
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final AdminProperties adminProperties;

    @Value("${app.cors.allowed-origins:https://nevolyn.com,https://www.nevolyn.com,http://localhost:3000}")
    private List<String> allowedOrigins;

    public SecurityConfig(AdminProperties adminProperties) {
        this.adminProperties = adminProperties;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
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

                        // Public: static images and assets
                        .requestMatchers("/nevolyn-logo*.png", "/*.png", "/favicon.ico", "/static/**").permitAll()

                        // Public: liveness probe for Docker healthcheck
                        .requestMatchers("/actuator/health/**").permitAll()

                        // Dev-only H2 console
                        .requestMatchers("/h2-console/**").permitAll()

                        // Everything else - admin routes - requires ADMIN role
                        .anyRequest().hasRole("ADMIN")
                )
                .headers(headers -> headers.frameOptions(frame -> frame.sameOrigin()))
                .httpBasic(Customizer.withDefaults());

        return http.build();
    }

    @Bean
    public UserDetailsService userDetailsService(PasswordEncoder passwordEncoder) {
        return new InMemoryUserDetailsManager(
                User.withUsername(adminProperties.getUsername())
                        .password(passwordEncoder.encode(adminProperties.getPassword()))
                        .roles("ADMIN")
                        .build()
        );
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
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
        configuration.setAllowedMethods(List.of("GET", "POST", "PATCH", "DELETE", "OPTIONS", "HEAD"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type", "X-Requested-With", "Accept", "Origin"));
        configuration.setExposedHeaders(List.of("Location", "Authorization"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);

        return source;
    }
}
