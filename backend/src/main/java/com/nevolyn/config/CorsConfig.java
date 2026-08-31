package com.nevolyn.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.List;

/**
 * Cross-Origin Resource Sharing (CORS) policy for the public REST API.
 *
 * <p>
 * The browser refuses to hand a cross-origin response to JavaScript unless the
 * server echoes the caller's {@code Origin} back in
 * {@code Access-Control-Allow-Origin}. Since the Next.js frontend (Vercel) and
 * this API (Render) live on different hosts, every browser call is cross-origin
 * and this configuration is what makes the contact and application forms work.
 *
 * @author NEVOLYN Technology Engineering
 * @version 0.2.0
 * @see <a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS">MDN: CORS</a>
 */
@Slf4j
@Configuration
public class CorsConfig {

    /**
     * Comma-separated allowed origins, sourced from {@code app.cors.allowed-origins}
     * and overridable per environment with {@code APP_CORS_ALLOWED_ORIGINS}.
     * Spring converts the comma-separated value into this list automatically.
     */
    @Value("${app.cors.allowed-origins:*}")
    private List<String> allowedOrigins;

    /**
     * Registers the CORS policy for {@code /api/v1/**}.
     *
     * <h2>Why setAllowedOriginPatterns and not setAllowedOrigins</h2>
     * <ul>
     * <li><b>Wildcards.</b> {@code allowedOrigins} compares strings exactly, so
     * it cannot express Vercel's per-commit preview hosts
     * ({@code https://nevolyn-a1b2c3.vercel.app}). {@code allowedOriginPatterns}
     * matches them with {@code https://nevolyn-*.vercel.app}, keeping preview
     * deployments usable against the production API.</li>
     * <li><b>Credentials.</b> The CORS spec forbids pairing
     * {@code allowCredentials(true)} with a literal {@code "*"} origin, and
     * Spring throws at startup if you try. Patterns are the supported way to
     * combine wildcard matching with credentialed requests: Spring reflects the
     * specific matching origin back rather than {@code *}.</li>
     * </ul>
     *
     * <h2>FUTURE CUSTOM DOMAIN INSTRUCTIONS</h2>
     * Do not edit this class to add a domain. Set the
     * {@code APP_CORS_ALLOWED_ORIGINS} environment variable in the Render
     * dashboard, e.g.
     *
     * <pre>
     *   https://nevolyn.com,https://www.nevolyn.com,https://nevolyn.vercel.app
     * </pre>
     *
     * Origins are scheme- and host-exact: {@code https://nevolyn.com} does
     * NOT cover {@code www.}, {@code http://} or a trailing slash. A missing
     * entry surfaces in the browser console as "No 'Access-Control-Allow-Origin'
     * header is present", never as a server-side error.
     *
     * @return the {@link WebMvcConfigurer} carrying the CORS registration
     */
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        // Collect default production domains + any configured custom origins
        java.util.LinkedHashSet<String> patterns = new java.util.LinkedHashSet<>();
        patterns.add("https://nevolyn.com");
        patterns.add("https://www.nevolyn.com");
        patterns.add("https://*.nevolyn.com");
        patterns.add("https://nevolyn.vercel.app");
        patterns.add("https://nevolyn-*.vercel.app");
        patterns.add("https://*.vercel.app");
        patterns.add("http://localhost:3000");
        patterns.add("http://127.0.0.1:3000");

        if (allowedOrigins != null) {
            for (String origin : allowedOrigins) {
                if (origin != null && !origin.isBlank()) {
                    patterns.add(origin.trim());
                }
            }
        }

        String[] originPatterns = patterns.toArray(new String[0]);
        log.info("Configuring CORS for /** with allowed origin patterns: {}", (Object) originPatterns);

        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**")
                        .allowedOriginPatterns(originPatterns)
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD")
                        .allowedHeaders("*")
                        .exposedHeaders("*")
                        .allowCredentials(false)
                        .maxAge(3600);
            }
        };
    }
}
