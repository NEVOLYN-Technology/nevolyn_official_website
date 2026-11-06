package com.nevolyn.officemanagement.security.network;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nevolyn.officemanagement.common.util.IpUtils;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.net.InetAddress;
import java.net.UnknownHostException;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

/**
 * Network-bound access control filter.
 *
 * <p>This is the Spring Security equivalent of the original Flask
 * {@code is_authorized_network} function in {@code app/__init__.py}.
 *
 * <p>Access rules (mirrored exactly from the Flask system):
 * <ul>
 *   <li><b>Admin</b>: unrestricted access from any network</li>
 *   <li><b>Employee</b>: access only from authorized local LAN prefixes,
 *       authorized public IPs/CIDRs, or with valid Wi-Fi secret header</li>
 *   <li><b>Unauthenticated</b>: pass-through (handled by auth filter downstream)</li>
 * </ul>
 *
 * <p>Routes exempt from network enforcement:
 * <ul>
 *   <li>{@code /api/v1/auth/login} — must be accessible to get a token</li>
 *   <li>{@code /actuator/health} — health check</li>
 *   <li>{@code /swagger-ui/**}, {@code /api-docs/**} — documentation</li>
 * </ul>
 */
@Slf4j
@Component
public class NetworkAccessFilter extends OncePerRequestFilter {

    private final List<String> allowedLocalPrefixes;
    private final List<String> allowedPublicIps;
    private final String rdWifiSecret;
    private final ObjectMapper objectMapper;

    /** Paths where office network verification is strictly enforced (attendance punch-in/out only). */
    private static final List<String> ATTENDANCE_PUNCH_PATHS = List.of(
            "/api/v1/attendance/check-in",
            "/api/v1/attendance/check-out"
    );

    public NetworkAccessFilter(
            @Value("${app.security.allowed-local-prefixes:${ALLOWED_LOCAL_PREFIXES:192.168.68.,127.0.0.1,::1}}") String allowedLocalPrefixesCsv,
            @Value("${app.security.allowed-public-ips:${ALLOWED_PUBLIC_IPS:${OFFICE_ALLOWED_IPS:}}}") String allowedPublicIpsCsv,
            @Value("${app.security.rd-wifi-secret:${RD_WIFI_SECRET:}}") String rdWifiSecret,
            ObjectMapper objectMapper
    ) {
        this.allowedLocalPrefixes = Arrays.stream(allowedLocalPrefixesCsv.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList();
        this.allowedPublicIps = StringUtils.hasText(allowedPublicIpsCsv)
                ? Arrays.stream(allowedPublicIpsCsv.split(","))
                        .map(String::trim)
                        .filter(s -> !s.isEmpty())
                        .toList()
                : List.of();
        this.rdWifiSecret = rdWifiSecret;
        this.objectMapper = objectMapper;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String path = request.getRequestURI();

        // Employees can log in and use the entire portal from any network;
        // network restriction applies ONLY to attendance check-in and check-out.
        if (!isAttendancePunchPath(path)) {
            filterChain.doFilter(request, response);
            return;
        }

        // Check if there is an authenticated user
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            // Unauthenticated — let the security chain handle 401
            filterChain.doFilter(request, response);
            return;
        }

        // ADMIN and SUPER_ADMIN are always allowed — no network restrictions
        boolean isAdmin = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_SUPER_ADMIN"));
        if (isAdmin) {
            filterChain.doFilter(request, response);
            return;
        }

        // Employee attendance check-in / check-out — must be on authorized office network
        String clientIp = IpUtils.extractClientIp(request);
        if (isAuthorizedNetwork(clientIp, request)) {
            filterChain.doFilter(request, response);
            return;
        }

        // Blocked — return 403 JSON response
        String username = auth.getName();
        log.warn("Attendance network check denied for user '{}' on '{}' from IP: {}", username, path, clientIp);
        sendForbiddenResponse(response, clientIp);
    }

    /**
     * Mirrors the Flask {@code is_authorized_network} function.
     * Checks local prefixes → public IP/CIDR list → Wi-Fi secret header.
     */
    private boolean isAuthorizedNetwork(String clientIp, HttpServletRequest request) {
        String normalizedIp = IpUtils.normalize(clientIp);

        // 1. Local prefix matching (e.g. 192.168.68., 127.0.0.1, ::1)
        for (String prefix : allowedLocalPrefixes) {
            if (IpUtils.matchesPrefix(normalizedIp, prefix)) {
                log.debug("IP {} matched local prefix '{}'", normalizedIp, prefix);
                return true;
            }
        }

        // 2. Public WAN IP or CIDR matching
        if (!allowedPublicIps.isEmpty()) {
            try {
                InetAddress clientAddr = InetAddress.getByName(normalizedIp);
                for (String entry : allowedPublicIps) {
                    if (matchesPublicIpEntry(clientAddr, normalizedIp, entry)) {
                        log.debug("IP {} matched public entry '{}'", normalizedIp, entry);
                        return true;
                    }
                }
            } catch (UnknownHostException e) {
                log.warn("Could not parse client IP '{}': {}", normalizedIp, e.getMessage());
            }
        }

        // 3. Hardware Wi-Fi secret token header
        if (StringUtils.hasText(rdWifiSecret)) {
            String headerSecret = request.getHeader("X-RD-Wifi-Secret");
            if (rdWifiSecret.equals(headerSecret)) {
                log.debug("IP {} authorized via Wi-Fi secret header", normalizedIp);
                return true;
            }
        }

        return false;
    }

    private boolean matchesPublicIpEntry(InetAddress clientAddr, String normalizedIp, String entry) {
        try {
            if (entry.contains("/")) {
                // CIDR notation
                String[] parts = entry.split("/");
                InetAddress networkAddr = InetAddress.getByName(parts[0]);
                int prefixLen = Integer.parseInt(parts[1]);
                return isInCidr(clientAddr, networkAddr, prefixLen);
            } else {
                // Exact IP match
                return clientAddr.equals(InetAddress.getByName(entry));
            }
        } catch (UnknownHostException | NumberFormatException e) {
            log.warn("Invalid public IP entry '{}': {}", entry, e.getMessage());
            return false;
        }
    }

    private boolean isInCidr(InetAddress ip, InetAddress network, int prefixLength) {
        byte[] ipBytes = ip.getAddress();
        byte[] networkBytes = network.getAddress();
        if (ipBytes.length != networkBytes.length) return false;

        int fullBytes = prefixLength / 8;
        int remainingBits = prefixLength % 8;

        for (int i = 0; i < fullBytes; i++) {
            if (ipBytes[i] != networkBytes[i]) return false;
        }
        if (remainingBits > 0 && fullBytes < ipBytes.length) {
            int mask = 0xFF << (8 - remainingBits);
            return (ipBytes[fullBytes] & mask) == (networkBytes[fullBytes] & mask);
        }
        return true;
    }

    private boolean isAttendancePunchPath(String path) {
        if (path == null) {
            return false;
        }
        return ATTENDANCE_PUNCH_PATHS.stream().anyMatch(path::startsWith);
    }

    private void sendForbiddenResponse(HttpServletResponse response, String clientIp) throws IOException {
        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.getWriter().write(objectMapper.writeValueAsString(Map.of(
                "success", false,
                "message", "Attendance check-in/check-out is only allowed from the authorized office network (Current IP: " + clientIp + ").",
                "clientIp", clientIp
        )));
    }
}
