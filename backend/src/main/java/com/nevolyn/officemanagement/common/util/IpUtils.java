package com.nevolyn.officemanagement.common.util;

import jakarta.servlet.http.HttpServletRequest;

import java.net.InetAddress;
import java.net.UnknownHostException;

// Client IP resolution and matching utilities.
public final class IpUtils {

    private IpUtils() {
        // Prevent instantiation
    }

    // Returns the verified client IP address for the request.
    public static String extractClientIp(HttpServletRequest request) {
        String remoteAddr = request.getRemoteAddr();
        return remoteAddr != null ? remoteAddr.trim() : "";
    }

    // Check if an IP address matches a given prefix (e.g. "192.168.68.").
    public static boolean matchesPrefix(String ip, String prefix) {
        return ip.equals(prefix) || ip.startsWith(prefix);
    }

    // Check if an IP address is a loopback address.
    public static boolean isLoopback(String ip) {
        try {
            return InetAddress.getByName(ip).isLoopbackAddress();
        } catch (UnknownHostException e) {
            return false;
        }
    }

    // Normalize an IP string for consistent comparison.
    public static String normalize(String ip) {
        if (ip == null) {
            return "";
        }
        return ip.trim();
    }
}
