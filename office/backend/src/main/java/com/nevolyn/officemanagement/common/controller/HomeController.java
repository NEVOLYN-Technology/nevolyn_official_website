package com.nevolyn.officemanagement.common.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * Root endpoint handler returning service status and discoverable endpoints.
 */
@RestController
public class HomeController {

    @GetMapping("/")
    public ResponseEntity<Map<String, Object>> root() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "service", "Nevolyn Office Management API",
                "version", "2.0.0",
                "health", "/actuator/health",
                "docs", "/swagger-ui.html"
        ));
    }
}
