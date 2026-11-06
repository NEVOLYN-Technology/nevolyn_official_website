package com.nevolyn.officemanagement;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableAsync;

/**
 * Entry point for the Nevolyn Office Management System.
 * <p>Nevolyn Office Management — Enterprise Operations & Project Management
 *
 * <p>This is a modular Spring Boot monolith with domains:
 * auth, user, attendance, project, experiment, development,
 * task, worklog, training, file, report, audit
 */
@SpringBootApplication
@EnableJpaAuditing
@EnableAsync
@ConfigurationPropertiesScan
public class OfficeManagementApplication {

    public static void main(String[] args) {
        SpringApplication.run(OfficeManagementApplication.class, args);
    }
}
