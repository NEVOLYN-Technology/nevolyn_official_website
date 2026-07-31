package com.saturn.rnd.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.saturn.rnd.dto.ApiResponse;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
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
 * Per-IP fixed-window rate limiter for the public write endpoints.
 *
 * <h2>Why</h2>
 * {@code POST /api/v1/contact} and {@code POST /api/v1/applications} are public,
 * unauthenticated, and each one writes a database row and dispatches email. The
 * honeypot field stops naive bots and email verification stops the results being
 * forwarded, but neither caps volume: a simple loop could still fill the
 * database and burn the Brevo sending quota. This filter bounds that.
 *
 * <h2>Design and its limits</h2>
 * A fixed window per IP, held in memory. That is the right weight for a single
 * free-tier instance and adds no dependency, but note:
 * <ul>
 * <li><b>Per-instance.</b> Counters are not shared, so N instances allow N times
 * the limit. Move to Redis or Bucket4j before scaling out.</li>
 * <li><b>Lost on restart.</b> Acceptable here; a restart is not a bypass an
 * attacker can trigger on demand.</li>
 * <li><b>Fixed, not sliding.</b> A burst straddling a window boundary can pass
 * up to twice the limit. Adequate for abuse control at this scale.</li>
 * </ul>
 * Stale entries are swept opportunistically so the map cannot grow without
 * bound from one-off visitors.
 *
 * @author Saturn R&D Engineering
 * @version 0.2.0
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class RateLimitFilter extends OncePerRequestFilter {

    /** Only these paths are limited; reads stay unthrottled. */
    private static final Map<String, String> LIMITED_PATHS = Map.of(
            "/api/v1/contact", "POST",
            "/api/v1/applications", "POST");

    /** Sweep stale buckets once the map grows past this many entries. */
    private static final int SWEEP_THRESHOLD = 1_000;

    /** Proxy-set header carrying the original client address. */
    private static final String X_FORWARDED_FOR = "X-Forwarded-For";

    private final ObjectMapper objectMapper;

    /** Requests permitted per IP per window. */
    @Value("${app.rate-limit.max-requests:5}")
    private int maxRequests;

    /** Window length in minutes. */
    @Value("${app.rate-limit.window-minutes:10}")
    private int windowMinutes;

    /** Master switch, so the limiter can be disabled in tests or locally. */
    @Value("${app.rate-limit.enabled:true}")
    private boolean enabled;

    private final Map<String, Window> buckets = new ConcurrentHashMap<>();

    /**
     * Counter for one client within one time window.
     *
     * @param windowStart when this window opened
     * @param count       requests seen since then
     */
    private record Window(Instant windowStart, AtomicInteger count) {
    }

    /**
     * Skips the filter entirely for anything that is not a limited endpoint,
     * which keeps reads and preflights off the bookkeeping path.
     */
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        if (!enabled) {
            return true;
        }
        String method = LIMITED_PATHS.get(request.getRequestURI());
        return method == null || !method.equalsIgnoreCase(request.getMethod());
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {

        String clientIp = resolveClientIp(request);

        if (isWithinLimit(clientIp)) {
            chain.doFilter(request, response);
            return;
        }

        log.warn("Rate limit exceeded for {} on {} — rejecting with 429.", clientIp, request.getRequestURI());
        writeTooManyRequests(response);
    }

    /**
     * Records a hit and reports whether it is allowed.
     *
     * <p>
     * {@code compute} runs atomically per key, so concurrent requests from the
     * same client cannot interleave and slip past the limit.
     */
    private boolean isWithinLimit(String clientIp) {
        Duration window = Duration.ofMinutes(windowMinutes);
        Instant now = Instant.now();

        sweepIfLarge(now, window);

        Window bucket = buckets.compute(clientIp, (key, existing) -> {
            // Start a fresh window on first contact, or once the old one expired.
            if (existing == null || Duration.between(existing.windowStart(), now).compareTo(window) >= 0) {
                return new Window(now, new AtomicInteger(1));
            }
            existing.count().incrementAndGet();
            return existing;
        });

        return bucket.count().get() <= maxRequests;
    }

    /**
     * Drops expired buckets once the map is large enough to be worth scanning.
     * Without this, every distinct visitor IP would be retained for the lifetime
     * of the process.
     */
    private void sweepIfLarge(Instant now, Duration window) {
        if (buckets.size() < SWEEP_THRESHOLD) {
            return;
        }
        buckets.entrySet().removeIf(entry ->
                Duration.between(entry.getValue().windowStart(), now).compareTo(window) >= 0);
    }

    /**
     * Determines the caller's address.
     *
     * <p>
     * Behind Render's proxy {@code getRemoteAddr()} returns the proxy, so every
     * visitor would share one bucket. {@code X-Forwarded-For} carries the
     * original client first in a comma-separated chain.
     *
     * <p>
     * NOTE: that header is client-supplied and trivially spoofed. It is trusted
     * here only because Render terminates TLS and overwrites it. Do not rely on
     * this for anything security-critical, and revisit it if the service is ever
     * exposed without a trusted proxy in front.
     */
    private String resolveClientIp(HttpServletRequest request) {
        String forwardedFor = request.getHeader(X_FORWARDED_FOR);
        if (forwardedFor != null && !forwardedFor.isBlank()) {
            return forwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    /** Writes a 429 in the same envelope shape as every other API response. */
    private void writeTooManyRequests(HttpServletResponse response) throws IOException {
        ApiResponse<Void> body = ApiResponse.error(
                HttpStatus.TOO_MANY_REQUESTS.value(),
                "Too many submissions from this address. Please wait a few minutes and try again.",
                null);

        response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");
        // Tells a well-behaved client how long to back off for.
        response.setHeader(HttpHeaders.RETRY_AFTER, String.valueOf(windowMinutes * 60L));
        response.getWriter().write(objectMapper.writeValueAsString(body));
    }
}
