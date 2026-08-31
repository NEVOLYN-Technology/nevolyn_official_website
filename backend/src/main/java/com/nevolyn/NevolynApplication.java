package com.nevolyn;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.event.ApplicationEnvironmentPreparedEvent;
import org.springframework.context.ApplicationListener;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;
import org.springframework.scheduling.annotation.EnableAsync;

import java.util.HashMap;
import java.util.Map;

/**
 * Main application entry point for the NEVOLYN Technology REST API backend.
 *
 * <p>
 * {@code @EnableAsync} activates the thread pool behind {@code EmailService}'s
 * {@code @Async} methods, which is what lets the contact and application
 * endpoints return immediately instead of blocking on mail delivery.
 *
 * @author NEVOLYN Technology Engineering
 * @version 0.3.0
 */
@EnableAsync
@SpringBootApplication
public class NevolynApplication {

    private static final Logger log = LoggerFactory.getLogger(NevolynApplication.class);

    public static void main(String[] args) {
        SpringApplication app = new SpringApplication(NevolynApplication.class);
        app.addListeners(cloudDatabaseUrlSanitizer());
        app.run(args);
    }

    /**
     * Normalises a PaaS-style {@code DATABASE_URL} into JDBC form before any
     * database bean is created.
     *
     * <h2>The problem</h2>
     * Render, Heroku and Railway publish their managed Postgres connection
     * string in libpq format:
     *
     * <pre>
     *   postgres://user:password&#64;host/dbname
     * </pre>
     *
     * The PostgreSQL JDBC driver cannot consume that. It requires the
     * {@code jdbc:} scheme, an explicit port, and credentials supplied as
     * separate properties rather than embedded userinfo:
     *
     * <pre>
     *   jdbc:postgresql://host:5432/dbname   (+ username / password properties)
     * </pre>
     *
     * Handed the raw value, Hikari fails at startup with
     * {@code No suitable driver} or {@code Driver claims to not accept jdbcUrl}.
     *
     * <h2>Why an ApplicationEnvironmentPreparedEvent listener</h2>
     * This event fires after Spring has read {@code application.yml} and the OS
     * environment, but <em>before</em> the {@code ApplicationContext} exists —
     * so before HikariCP, JPA or any migration tool reads its configuration.
     * That makes it the last safe point to rewrite datasource properties.
     * Doing the same work in a {@code @Bean} or {@code @PostConstruct} would be
     * too late: the pool has already tried, and failed, to connect.
     *
     * <p>
     * The rewritten values are pushed in with {@code addFirst(...)} so they sit
     * at the FRONT of the property source chain and outrank the raw OS
     * environment variable they were derived from. Without {@code addFirst} the
     * original malformed {@code DATABASE_URL} would still win.
     *
     * <p>
     * When {@code DATABASE_URL} is absent — every local run — the listener does
     * nothing and the H2 settings in {@code application.yml} stand.
     *
     * @return listener that parses and republishes the datasource properties
     */
    private static ApplicationListener<ApplicationEnvironmentPreparedEvent> cloudDatabaseUrlSanitizer() {
        return event -> {
            ConfigurableEnvironment environment = event.getEnvironment();
            String rawUrl = environment.getProperty("DATABASE_URL");
            if (rawUrl == null || rawUrl.isBlank()) {
                rawUrl = environment.getProperty("SPRING_DATASOURCE_URL");
            }

            // Local development: nothing injected, keep the H2 defaults.
            if (rawUrl == null || rawUrl.isBlank()) {
                return;
            }

            String url = rawUrl.trim();
            Map<String, Object> sanitized = new HashMap<>();

            if (url.contains("postgres") || url.contains("5432")) {
                sanitized.put("spring.datasource.driver-class-name", "org.postgresql.Driver");
                sanitized.put("spring.datasource.driverClassName", "org.postgresql.Driver");
            }

            // Already a JDBC URL (some providers do this) — ensure postgres driver is set and return
            if (url.startsWith("jdbc:")) {
                if (!sanitized.isEmpty()) {
                    environment.getPropertySources().addFirst(new MapPropertySource("sanitizedCloudDatasource", sanitized));
                }
                return;
            }

            // Step 1 — strip the libpq scheme. Both spellings occur in the wild.
            if (url.startsWith("postgres://")) {
                url = url.substring("postgres://".length());
            } else if (url.startsWith("postgresql://")) {
                url = url.substring("postgresql://".length());
            } else {
                log.warn("DATABASE_URL has an unrecognised scheme; leaving datasource configuration untouched.");
                return;
            }

            // Step 2 — split embedded credentials off the authority section.
            // JDBC will not accept user:password@host, so they move to their own
            // properties. Split on the LAST '@' because passwords may contain one.
            int atIndex = url.lastIndexOf('@');
            if (atIndex >= 0) {
                String userInfo = url.substring(0, atIndex);
                url = url.substring(atIndex + 1);

                int colonIndex = userInfo.indexOf(':');
                if (colonIndex >= 0) {
                    sanitized.put("spring.datasource.username", userInfo.substring(0, colonIndex));
                    sanitized.put("spring.datasource.password", userInfo.substring(colonIndex + 1));
                } else {
                    sanitized.put("spring.datasource.username", userInfo);
                }
            }

            // Step 3 — guarantee an explicit port. Providers frequently omit it,
            // and the driver will not infer 5432 when a database path follows.
            // Only the authority may be modified, never the query string
            // (?sslmode=require), which legitimately contains ':' and '/'.
            int queryIndex = url.indexOf('?');
            String beforeQuery = queryIndex >= 0 ? url.substring(0, queryIndex) : url;
            String query = queryIndex >= 0 ? url.substring(queryIndex) : "";

            int slashIndex = beforeQuery.indexOf('/');
            String authority = slashIndex >= 0 ? beforeQuery.substring(0, slashIndex) : beforeQuery;
            String path = slashIndex >= 0 ? beforeQuery.substring(slashIndex) : "";

            if (!authority.contains(":")) {
                authority = authority + ":5432";
            }

            String jdbcUrl = "jdbc:postgresql://" + authority + path + query;
            sanitized.put("spring.datasource.url", jdbcUrl);

            // Log the host but never the credentials.
            log.info("Sanitized cloud DATABASE_URL into JDBC form: jdbc:postgresql://{}{}", authority, path);

            // Step 4 — publish ahead of every other source, including the OS env.
            environment.getPropertySources()
                    .addFirst(new MapPropertySource("sanitizedCloudDatasource", sanitized));
        };
    }
}
