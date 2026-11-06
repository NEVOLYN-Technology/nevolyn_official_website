package com.nevolyn.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

/**
 * Enables Spring Data JPA Auditing ({@code @CreatedDate}, {@code @LastModifiedDate})
 * for all entities annotated with {@code @EntityListeners(AuditingEntityListener.class)}.
 */
@Configuration
@EnableJpaAuditing
public class JpaAuditingConfig {
}

