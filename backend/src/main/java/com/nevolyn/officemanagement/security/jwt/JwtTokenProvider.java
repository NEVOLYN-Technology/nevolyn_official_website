package com.nevolyn.officemanagement.security.jwt;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.stream.Collectors;

// JWT token generation, validation, and parsing.
@Component
public class JwtTokenProvider {

    private static final Logger log = LoggerFactory.getLogger(JwtTokenProvider.class);

    private final SecretKey signingKey;
    private final long expirationMs;
    private final JwtParser jwtParser;

    public JwtTokenProvider(
            @Value("${app.jwt.secret:${JWT_SECRET:${OFFICE_JWT_SECRET:}}}") String secret,
            @Value("${app.jwt.expiration-ms:28800000}") long expirationMs,
            @Value("${spring.profiles.active:}") String activeProfile
    ) {
        this.expirationMs = expirationMs;
        if (secret != null && secret.trim().length() >= 32) {
            String cleanSecret = secret.trim();
            if ((cleanSecret.startsWith("'") && cleanSecret.endsWith("'"))
                    || (cleanSecret.startsWith("\"") && cleanSecret.endsWith("\""))) {
                cleanSecret = cleanSecret.substring(1, cleanSecret.length() - 1).trim();
            }
            byte[] keyBytes = Decoders.BASE64.decode(
                    java.util.Base64.getEncoder().encodeToString(cleanSecret.getBytes(java.nio.charset.StandardCharsets.UTF_8))
            );
            this.signingKey = Keys.hmacShaKeyFor(keyBytes);
        } else {
            log.warn("SECURITY NOTICE: app.jwt.secret not configured or shorter than 32 chars (profile={}) — generating secure in-memory HS512 signing key.", activeProfile);
            this.signingKey = Jwts.SIG.HS512.key().build();
        }
        this.jwtParser = Jwts.parser().verifyWith(signingKey).build();
    }

    // Generate a signed JWT token for an authenticated principal.
    public String generateToken(Authentication authentication) {
        String username = authentication.getName();
        String roles = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.joining(","));

        return generateToken(username, roles, null);
    }

    // Generate a token directly from a username, roles string, and active session role.
    public String generateToken(String username, String roles, String activeRole) {
        JwtBuilder builder = Jwts.builder()
                .subject(username)
                .claim("roles", roles)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expirationMs))
                .signWith(signingKey);
        if (activeRole != null && !activeRole.isBlank()) {
            builder.claim("activeRole", activeRole);
        }
        return builder.compact();
    }

    // Generate a token directly from a username and roles string.
    public String generateToken(String username, String roles) {
        return generateToken(username, roles, null);
    }

    // Extract the username (subject) from a JWT token.
    public String extractUsername(String token) {
        return jwtParser.parseSignedClaims(token).getPayload().getSubject();
    }

    // Extract the comma-separated authorities string from a JWT token.
    public String extractRoles(String token) {
        return jwtParser.parseSignedClaims(token).getPayload().get("roles", String.class);
    }

    // Extract the active session role ("super_admin", "admin", or "employee") from a JWT token.
    public String extractActiveRole(String token) {
        return jwtParser.parseSignedClaims(token).getPayload().get("activeRole", String.class);
    }

    // Validate the token signature and expiration.
    public boolean validateToken(String token) {
        try {
            jwtParser.parseSignedClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException ex) {
            log.debug("JWT token invalid or expired: {}", ex.getMessage());
        } catch (Exception ex) {
            log.debug("Unexpected JWT validation exception: {}", ex.getMessage());
        }
        return false;
    }
}
