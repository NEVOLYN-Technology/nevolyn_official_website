package com.nevolyn.controller;

import com.nevolyn.dto.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * Root health and status controller for NEVOLYN Technology REST API Backend.
 *
 * @author NEVOLYN Technology Engineering
 */
@RestController
public class HomeController {

    @GetMapping("/")
    public ResponseEntity<ApiResponse<Map<String, String>>> rootStatus() {
        Map<String, String> info = Map.of(
            "status", "UP",
            "service", "NEVOLYN Technology REST API Backend",
            "version", "0.3.0",
            "environment", "production"
        );
        return ResponseEntity.ok(ApiResponse.success(200, "NEVOLYN Technology REST API is online and operational.", info));
    }
}
