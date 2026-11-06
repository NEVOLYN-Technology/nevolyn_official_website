package com.nevolyn.officemanagement.security.jwt;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

/**
 * JWT authentication filter.
 *
 * <p>Reads the JWT token from:
 * <ol>
 *   <li>HTTP-only cookie named {@code nevolyn_access_token} (primary — browser clients)</li>
 *   <li>Authorization: Bearer header (fallback — Swagger UI, API clients)</li>
 * </ol>
 *
 * <p>On a valid token, populates the Spring Security context with the session-specific
 * authorities embedded in the token (reflecting whether the user logged in with their
 * Super Admin password, Admin password, or individual Employee password).
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider;
    private final UserDetailsService userDetailsService;

    @Value("${app.jwt.cookie-name:nevolyn_access_token}")
    private String cookieName;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String token = extractTokenFromCookie(request);
        if (!StringUtils.hasText(token) || !jwtTokenProvider.validateToken(token)) {
            String headerToken = extractTokenFromHeader(request);
            if (StringUtils.hasText(headerToken) && jwtTokenProvider.validateToken(headerToken)) {
                token = headerToken;
            }
        }

        if (StringUtils.hasText(token) && jwtTokenProvider.validateToken(token)) {
            String username = jwtTokenProvider.extractUsername(token);
            UserDetails baseUser = userDetailsService.loadUserByUsername(username);

            if (baseUser.isEnabled()) {
                String tokenRoles = jwtTokenProvider.extractRoles(token);
                String activeRole = jwtTokenProvider.extractActiveRole(token);

                List<SimpleGrantedAuthority> sessionAuthorities;
                if (StringUtils.hasText(tokenRoles)) {
                    sessionAuthorities = Arrays.stream(tokenRoles.split(","))
                            .map(String::trim)
                            .filter(StringUtils::hasText)
                            .map(SimpleGrantedAuthority::new)
                            .toList();
                } else {
                    sessionAuthorities = baseUser.getAuthorities().stream()
                            .map(a -> new SimpleGrantedAuthority(a.getAuthority()))
                            .toList();
                }

                UserDetails sessionPrincipal = org.springframework.security.core.userdetails.User.builder()
                        .username(baseUser.getUsername())
                        .password(baseUser.getPassword())
                        .authorities(sessionAuthorities)
                        .disabled(!baseUser.isEnabled())
                        .build();

                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(sessionPrincipal, null, sessionAuthorities);
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                if (StringUtils.hasText(activeRole)) {
                    request.setAttribute("activeRole", activeRole);
                }

                SecurityContextHolder.getContext().setAuthentication(authentication);
                log.debug("Authenticated user '{}' via JWT with activeRole='{}'", username, activeRole);
            }
        }

        filterChain.doFilter(request, response);
    }

    private String extractTokenFromCookie(HttpServletRequest request) {
        if (request.getCookies() == null) return null;
        return Arrays.stream(request.getCookies())
                .filter(c -> cookieName.equals(c.getName()))
                .map(Cookie::getValue)
                .findFirst()
                .orElse(null);
    }

    private String extractTokenFromHeader(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (StringUtils.hasText(header) && header.startsWith("Bearer ")) {
            return header.substring(7);
        }
        return null;
    }
}
