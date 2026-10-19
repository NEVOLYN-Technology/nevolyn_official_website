package com.nevolyn.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * Typed configuration binding for {@code app.admin.*} in application.yml.
 *
 * <p>Values are injected from environment variables:
 * <ul>
 *   <li>ADMIN_USERNAME → app.admin.username</li>
 *   <li>ADMIN_PASSWORD → app.admin.password</li>
 * </ul>
 */
@Getter
@Setter
@Configuration
@ConfigurationProperties(prefix = "app.admin")
public class AdminProperties {
    private String username = "admin";
    private String password = "changeme";
}
