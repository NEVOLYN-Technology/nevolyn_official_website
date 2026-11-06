package com.nevolyn.officemanagement.auth.controller;

import com.nevolyn.officemanagement.auth.dto.LoginRequest;
import com.nevolyn.officemanagement.auth.dto.LoginResponse;
import com.nevolyn.officemanagement.auth.service.AuthService;
import com.nevolyn.officemanagement.common.response.ApiResponse;
import com.nevolyn.officemanagement.common.util.IpUtils;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;

/**
 * Authentication endpoints.
 *
 * <p>POST /api/v1/auth/login   — authenticate and receive JWT in HTTP-only cookie
 * POST /api/v1/auth/logout  — clear the JWT cookie and record audit
 * GET  /api/v1/auth/me      — get current user profile
 * PATCH /api/v1/auth/profile/password — change own password
 */
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @Value("${app.jwt.cookie-name:nevolyn_access_token}")
    private String cookieName;

    @Value("${app.jwt.expiration-ms:86400000}")
    private long expirationMs;

    @Value("${app.jwt.cookie-secure:false}")
    private boolean cookieSecure;

    @Value("${app.jwt.cookie-same-site:Lax}")
    private String cookieSameSite;

    @Value("${app.jwt.cookie-domain:}")
    private String cookieDomain;
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse
    ) {
        String clientIp = IpUtils.extractClientIp(httpRequest);
        AuthService.AuthResult result = authService.login(request, clientIp);

        // Build secure HTTP-only cookie via Spring's ResponseCookie
        ResponseCookie.ResponseCookieBuilder cookieBuilder = ResponseCookie.from(cookieName, result.token())
                .httpOnly(true)
                .secure(cookieSecure)
                .path("/")
                .maxAge(Duration.ofMillis(expirationMs))
                .sameSite(cookieSameSite);

        if (cookieDomain != null && !cookieDomain.isBlank()) {
            cookieBuilder.domain(cookieDomain.trim());
        }

        httpResponse.addHeader(HttpHeaders.SET_COOKIE, cookieBuilder.build().toString());

        return ResponseEntity.ok(ApiResponse.success("Login successful", result.user()));
    }
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(
            @AuthenticationPrincipal UserDetails userDetails,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse
    ) {
        if (userDetails != null) {
            authService.logout(userDetails.getUsername(), IpUtils.extractClientIp(httpRequest));
        }

        // Clear the JWT cookie
        ResponseCookie.ResponseCookieBuilder clearBuilder = ResponseCookie.from(cookieName, "")
                .httpOnly(true)
                .secure(cookieSecure)
                .path("/")
                .maxAge(0)
                .sameSite(cookieSameSite);

        if (cookieDomain != null && !cookieDomain.isBlank()) {
            clearBuilder.domain(cookieDomain.trim());
        }

        httpResponse.addHeader(HttpHeaders.SET_COOKIE, clearBuilder.build().toString());

        return ResponseEntity.ok(ApiResponse.success("Logged out successfully"));
    }
    @GetMapping({"/me", "/profile"})
    public ResponseEntity<ApiResponse<LoginResponse>> getCurrentUser(
            @AuthenticationPrincipal UserDetails userDetails,
            HttpServletRequest httpRequest
    ) {
        String activeRole = (String) httpRequest.getAttribute("activeRole");
        LoginResponse profile = authService.getProfile(userDetails.getUsername(), activeRole);
        return ResponseEntity.ok(ApiResponse.success(profile));
    }
    @PatchMapping("/profile/password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @Valid @RequestBody com.nevolyn.officemanagement.auth.dto.SelfPasswordChangeRequest request,
            @AuthenticationPrincipal UserDetails userDetails,
            HttpServletRequest httpRequest,
            org.springframework.security.crypto.password.PasswordEncoder passwordEncoder
    ) {
        String clientIp = IpUtils.extractClientIp(httpRequest);
        authService.changePassword(userDetails.getUsername(), request, clientIp, passwordEncoder);
        return ResponseEntity.ok(ApiResponse.success("Password updated successfully"));
    }
}
