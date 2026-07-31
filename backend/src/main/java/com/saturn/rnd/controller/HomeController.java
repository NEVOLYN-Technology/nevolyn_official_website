package com.saturn.rnd.controller;

import com.saturn.rnd.dto.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * Root health and status controller for Saturn Textiles R&D REST API Backend.
 */
@RestController
public class HomeController {

    @GetMapping("/")
    public ResponseEntity<ApiResponse<Map<String, String>>> rootStatus() {
        Map<String, String> info = Map.of(
            "status", "UP",
            "service", "Saturn Textiles Limited R&D REST API Backend",
            "version", "0.2.0"
        );
        return ResponseEntity.ok(ApiResponse.success(200, "Saturn R&D REST API is online and operational.", info));
    }
}
