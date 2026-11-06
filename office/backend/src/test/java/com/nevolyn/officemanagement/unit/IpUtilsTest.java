package com.nevolyn.officemanagement.unit;

import com.nevolyn.officemanagement.common.util.IpUtils;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Unit tests for {@link IpUtils} IP extraction.
 *
 * <p>Mirrors Python tests:
 * - {@code test_employee_local_access_allowed}
 * - {@code test_employee_remote_access_blocked}
 * - {@code test_allowed_public_ips_env_config}
 */
@DisplayName("IpUtils Unit Tests")
class IpUtilsTest {

    @Test
    @DisplayName("X-Forwarded-For header takes precedence over CF-Connecting-IP (matches legacy priority)")
    void xForwardedForTakesPrecedenceOverCloudflare() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("X-Forwarded-For", "5.6.7.8");
        request.addHeader("CF-Connecting-IP", "1.2.3.4");
        assertThat(IpUtils.extractClientIp(request)).isEqualTo("5.6.7.8");
    }

    @Test
    @DisplayName("X-Forwarded-For with multiple IPs — takes the first")
    void xForwardedForMultiple() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("X-Forwarded-For", "192.168.1.1, 10.0.0.1, 172.16.0.1");
        assertThat(IpUtils.extractClientIp(request)).isEqualTo("192.168.1.1");
    }

    @Test
    @DisplayName("No proxy headers — falls back to remoteAddr")
    void noProxyHeader_fallsBackToRemoteAddr() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setRemoteAddr("127.0.0.1");
        assertThat(IpUtils.extractClientIp(request)).isEqualTo("127.0.0.1");
    }

    @Test
    @DisplayName("Local prefix matching works for 192.168.68.x subnet")
    void localPrefixMatch() {
        assertThat(IpUtils.matchesPrefix("192.168.68.100", "192.168.68.")).isTrue();
        assertThat(IpUtils.matchesPrefix("192.168.1.100", "192.168.68.")).isFalse();
    }

    @Test
    @DisplayName("Loopback addresses are detected correctly")
    void loopbackDetection() {
        assertThat(IpUtils.isLoopback("127.0.0.1")).isTrue();
        assertThat(IpUtils.isLoopback("::1")).isTrue();
        assertThat(IpUtils.isLoopback("192.168.1.1")).isFalse();
    }
}
