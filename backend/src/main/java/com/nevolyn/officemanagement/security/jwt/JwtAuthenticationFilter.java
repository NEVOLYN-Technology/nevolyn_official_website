package com.nevolyn.officemanagement.security.jwt;

import com.nevolyn.officemanagement.auth.service.AuthService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Lazy;
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
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.Base64;
import java.util.List;

// JWT and HTTP Basic authentication filter for Office Management and Admin Operations portals.
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    private final JwtTokenProvider jwtTokenProvider;
    private final UserDetailsService userDetailsService;
    private final AuthService authService;

    @Value("${app.jwt.cookie-name:nevolyn_access_token}")
    private String cookieName;

    public JwtAuthenticationFilter(
            JwtTokenProvider jwtTokenProvider,
            UserDetailsService userDetailsService,
            @Lazy AuthService authService
    ) {
        this.jwtTokenProvider = jwtTokenProvider;
        this.userDetailsService = userDetailsService;
        this.authService = authService;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String token = extractTokenFromHeader(request);
        if (!StringUtils.hasText(token) || !jwtTokenProvider.validateToken(token)) {
            String cookieToken = extractTokenFromCookie(request);
            if (StringUtils.hasText(cookieToken) && jwtTokenProvider.validateToken(cookieToken)) {
                token = cookieToken;
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
        } else {
            // Check for HTTP Basic credentials (used by /admin Operations Dashboard)
            UsernamePasswordAuthenticationToken basicAuth = tryAuthenticateBasicHeader(request);
            if (basicAuth != null) {
                basicAuth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(basicAuth);
                log.debug("Authenticated admin user '{}' via HTTP Basic", basicAuth.getName());
            }
        }

        filterChain.doFilter(request, response);
    }

    private UsernamePasswordAuthenticationToken tryAuthenticateBasicHeader(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (!StringUtils.hasText(header) || !header.regionMatches(true, 0, "Basic ", 0, 6)) {
            return null;
        }
        try {
            String base64Token = header.substring(6).trim();
            byte[] decodedBytes = Base64.getDecoder().decode(base64Token);
            String credentials = new String(decodedBytes, StandardCharsets.UTF_8);
            int delim = credentials.indexOf(':');
            if (delim < 0) {
                return null;
            }
            String username = credentials.substring(0, delim);
            String password = credentials.substring(delim + 1);
            return authService.authenticateBasicHeader(username, password);
        } catch (IllegalArgumentException ex) {
            return null;
        }
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
