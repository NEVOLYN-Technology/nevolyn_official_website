package com.nevolyn.officemanagement.security.jwt;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.stream.Collectors;

/**
 * JWT token generation, validation, and parsing.
 *
 * <p>Tokens are signed with HMAC-SHA512 using the configured secret.
 * Claims include: subject (username), roles, activeRole, and expiration.
 */
@Slf4j
@Component
public class JwtTokenProvider {

    private final SecretKey signingKey;
    private final long expirationMs;
    private final JwtParser jwtParser;

    public JwtTokenProvider(
            @Value("${app.jwt.secret}") String secret,
            @Value("${app.jwt.expiration-ms}") long expirationMs
    ) {
        byte[] keyBytes = Decoders.BASE64.decode(
                java.util.Base64.getEncoder().encodeToString(secret.getBytes())
        );
        this.signingKey = Keys.hmacShaKeyFor(keyBytes);
        this.expirationMs = expirationMs;
        this.jwtParser = Jwts.parser().verifyWith(signingKey).build();
    }

    /**
     * Generate a signed JWT token for an authenticated principal.
     */
    public String generateToken(Authentication authentication) {
        String username = authentication.getName();
        String roles = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.joining(","));

        return generateToken(username, roles, null);
    }

    /**
     * Generate a token directly from a username, roles string, and active session role.
     */
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

    /**
     * Generate a token directly from a username and roles string.
     */
    public String generateToken(String username, String roles) {
        return generateToken(username, roles, null);
    }

    /**
     * Extract the username (subject) from a JWT token.
     */
    public String extractUsername(String token) {
        return jwtParser.parseSignedClaims(token).getPayload().getSubject();
    }

    /**
     * Extract the comma-separated authorities string from a JWT token.
     */
    public String extractRoles(String token) {
        return jwtParser.parseSignedClaims(token).getPayload().get("roles", String.class);
    }

    /**
     * Extract the active session role ("super_admin", "admin", or "employee") from a JWT token.
     */
    public String extractActiveRole(String token) {
        return jwtParser.parseSignedClaims(token).getPayload().get("activeRole", String.class);
    }

    /**
     * Validate the token signature and expiration.
     *
     * @return true if valid, false otherwise
     */
    public boolean validateToken(String token) {
        try {
            jwtParser.parseSignedClaims(token);
            return true;
        } catch (ExpiredJwtException ex) {
            log.debug("JWT token expired: {}", ex.getMessage());
        } catch (MalformedJwtException ex) {
            log.debug("JWT token malformed: {}", ex.getMessage());
        } catch (SecurityException ex) {
            log.debug("JWT signature invalid: {}", ex.getMessage());
        } catch (IllegalArgumentException ex) {
            log.debug("JWT token empty or null: {}", ex.getMessage());
        }
        return false;
    }
}
