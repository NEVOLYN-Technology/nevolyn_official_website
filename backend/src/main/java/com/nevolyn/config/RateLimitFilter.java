package com.nevolyn.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nevolyn.dto.ApiResponse;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Per-IP fixed-window rate limiter for public write and authentication endpoints.
 *
 * <p>Protects public forms against automated spam flooding and throttles
 * login attempts against credential brute-forcing.
 */
@Slf4j
@Component
public class RateLimitFilter extends OncePerRequestFilter {

    /** Only these paths are limited; reads stay unthrottled. */
    private static final Map<String, String> LIMITED_PATHS = Map.of(
            "/api/v1/contact", "POST",
            "/api/v1/applications", "POST",
            "/api/v1/auth/login", "POST"
    );

    /** Office login path - limited separately to blunt credential brute-forcing. */
    private static final String LOGIN_PATH = "/api/v1/auth/login";

    /** Sweep stale buckets once the map grows past this many entries. */
    private static final int SWEEP_THRESHOLD = 1_000;

    private final ObjectMapper objectMapper;

    public RateLimitFilter(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    /** Requests permitted per IP per window for public forms. */
    @Value("${app.rate-limit.max-requests:5}")
    private int maxRequests;

    /** Login attempts permitted per IP per window. */
    @Value("${app.rate-limit.login-max-requests:10}")
    private int loginMaxRequests;

    /** Window length in minutes. */
    @Value("${app.rate-limit.window-minutes:10}")
    private int windowMinutes;

    /** Master switch, so the limiter can be disabled in tests or locally. */
    @Value("${app.rate-limit.enabled:true}")
    private boolean enabled;

    private final Map<String, ClientWindow> buckets = new ConcurrentHashMap<>();

    /**
     * Counter for one client within one time window.
     */
    private static class ClientWindow {
        final Instant windowStart;
        final AtomicInteger count;

        ClientWindow(Instant windowStart, AtomicInteger count) {
            this.windowStart = windowStart;
            this.count = count;
        }
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        if (!enabled) {
            return true;
        }
        String method = LIMITED_PATHS.get(request.getRequestURI());
        return method == null || !method.equalsIgnoreCase(request.getMethod());
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain chain
    ) throws ServletException, IOException {

        String clientIp = resolveClientIp(request);
        String path = request.getRequestURI();
        int limit = LOGIN_PATH.equals(path) ? loginMaxRequests : maxRequests;

        // Bucket per (clientIp + path) so login attempts never consume the contact-form quota
        if (isWithinLimit(clientIp + '|' + path, limit)) {
            chain.doFilter(request, response);
            return;
        }

        log.warn("Rate limit exceeded for {} on {} - rejecting with 429.", clientIp, path);
        writeTooManyRequests(response);
    }

    private boolean isWithinLimit(String bucketKey, int limit) {
        Duration window = Duration.ofMinutes(windowMinutes);
        Instant now = Instant.now();

        sweepIfLarge(now, window);

        ClientWindow bucket = buckets.compute(bucketKey, (key, existing) -> {
            if (existing == null || Duration.between(existing.windowStart, now).compareTo(window) >= 0) {
                return new ClientWindow(now, new AtomicInteger(1));
            }
            existing.count.incrementAndGet();
            return existing;
        });

        return bucket.count.get() <= limit;
    }

    private void sweepIfLarge(Instant now, Duration window) {
        if (buckets.size() < SWEEP_THRESHOLD) {
            return;
        }
        buckets.entrySet().removeIf(entry -> {
            ClientWindow w = entry.getValue();
            return w != null && Duration.between(w.windowStart, now).compareTo(window) >= 0;
        });
    }

    private String resolveClientIp(HttpServletRequest request) {
        String forwardedFor = request.getHeader("X-Forwarded-For");
        if (forwardedFor != null && !forwardedFor.isBlank()) {
            return forwardedFor.split(",")[0].trim();
        }
        String remoteAddr = request.getRemoteAddr();
        return remoteAddr != null ? remoteAddr : "";
    }

    private void writeTooManyRequests(HttpServletResponse response) throws IOException {
        ApiResponse<Void> body = ApiResponse.error(
                HttpStatus.TOO_MANY_REQUESTS.value(),
                "Too many requests from this address. Please wait a few minutes and try again.",
                null
        );

        response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");
        response.setHeader(HttpHeaders.RETRY_AFTER, String.valueOf(windowMinutes * 60L));
        response.getWriter().write(objectMapper.writeValueAsString(body));
    }
}
