package com.nevolyn.officemanagement.common.util;

import jakarta.servlet.http.HttpServletRequest;
import lombok.experimental.UtilityClass;
import lombok.extern.slf4j.Slf4j;

import java.net.InetAddress;
import java.net.UnknownHostException;
import java.util.List;

/**
 * IP address extraction and validation utilities.
 *
 * <p>Mirrors the IP logic from the original Flask {@code is_authorized_network} function,
 * handling Cloudflare, Render, and standard reverse proxy headers.
 */
@Slf4j
@UtilityClass
public class IpUtils {

    /**
     * Priority-ordered list of proxy headers to check for real client IP.
     * Mirrors legacy Flask system: X-Forwarded-For takes precedence, then CF-Connecting-IP.
     */
    private static final List<String> IP_HEADERS = List.of(
            "X-Forwarded-For",
            "CF-Connecting-IP",
            "Cf-Connecting-Ip",
            "X-Real-IP",
            "Proxy-Client-IP",
            "WL-Proxy-Client-IP"
    );

    /**
     * Extract the real client IP address from the request, considering proxy headers.
     *
     * @param request the HTTP servlet request
     * @return the client IP string, never null
     */
    public static String extractClientIp(HttpServletRequest request) {
        for (String header : IP_HEADERS) {
            String value = request.getHeader(header);
            if (value != null && !value.isBlank() && !"unknown".equalsIgnoreCase(value)) {
                // X-Forwarded-For may contain a comma-separated list; take the first
                String ip = value.split(",")[0].trim();
                if (!ip.isEmpty()) {
                    log.debug("Client IP extracted from header '{}': {}", header, ip);
                    return ip;
                }
            }
        }
        String remoteAddr = request.getRemoteAddr();
        log.debug("Client IP from remoteAddr: {}", remoteAddr);
        return remoteAddr;
    }

    /**
     * Check if an IP address matches a given prefix (e.g. "192.168.68.").
     */
    public static boolean matchesPrefix(String ip, String prefix) {
        return ip.equals(prefix) || ip.startsWith(prefix);
    }

    /**
     * Check if an IP address is a loopback address.
     */
    public static boolean isLoopback(String ip) {
        try {
            return InetAddress.getByName(ip).isLoopbackAddress();
        } catch (UnknownHostException e) {
            return false;
        }
    }

    /**
     * Normalize IPv6 loopback (::1) to "::1" for consistent comparison.
     */
    public static String normalize(String ip) {
        if (ip == null) return "";
        return ip.trim();
    }
}
