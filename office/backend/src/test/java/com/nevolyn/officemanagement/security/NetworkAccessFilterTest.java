package com.nevolyn.officemanagement.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nevolyn.officemanagement.security.network.NetworkAccessFilter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import java.io.IOException;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("NetworkAccessFilter Parity Tests")
class NetworkAccessFilterTest {

    private NetworkAccessFilter filter;
    private ObjectMapper objectMapper;

    private static final String ALLOWED_LOCAL = "192.168.68.,127.0.0.1,::1";
    private static final String ALLOWED_PUBLIC = "198.51.100.0/24,203.0.113.50";
    private static final String WIFI_SECRET = "rd-super-secret-lan-token";

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        filter = new NetworkAccessFilter(true, ALLOWED_LOCAL, ALLOWED_PUBLIC, WIFI_SECRET, objectMapper);
        SecurityContextHolder.clearContext();
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    private void authenticateAs(String username, String role) {
        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                username,
                null,
                List.of(new SimpleGrantedAuthority("ROLE_" + role.toUpperCase()))
        );
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    @Test
    @DisplayName("Admin remote access: Admin is allowed from any external IP without restrictions")
    void adminUser_fromExternalIp_shouldPassThrough() throws ServletException, IOException {
        authenticateAs("admin", "ADMIN");

        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/v1/projects");
        request.setRemoteAddr("203.0.113.99");
        MockHttpServletResponse response = new MockHttpServletResponse();
        MockFilterChain chain = new MockFilterChain();

        filter.doFilter(request, response, chain);

        assertThat(response.getStatus()).isEqualTo(200);
        assertThat(chain.getRequest()).isNotNull();
    }

    @Test
    @DisplayName("Employee network restriction: Employee is blocked from unauthorized external IP")
    void employeeUser_fromExternalIp_withoutSecret_shouldBeBlocked403() throws ServletException, IOException {
        authenticateAs("john.doe", "EMPLOYEE");

        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/v1/attendance/check-in");
        request.setRemoteAddr("203.0.113.99");
        MockHttpServletResponse response = new MockHttpServletResponse();
        MockFilterChain chain = new MockFilterChain();

        filter.doFilter(request, response, chain);

        assertThat(response.getStatus()).isEqualTo(403);
        assertThat(response.getContentAsString()).contains("Access denied");
        assertThat(chain.getRequest()).isNull();
    }

    @Test
    @DisplayName("Employee LAN access: Employee is allowed from authorized local prefix 192.168.68.x")
    void employeeUser_fromLocalPrefix_shouldPassThrough() throws ServletException, IOException {
        authenticateAs("john.doe", "EMPLOYEE");

        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/v1/attendance/check-in");
        request.setRemoteAddr("192.168.68.105");
        MockHttpServletResponse response = new MockHttpServletResponse();
        MockFilterChain chain = new MockFilterChain();

        filter.doFilter(request, response, chain);

        assertThat(response.getStatus()).isEqualTo(200);
        assertThat(chain.getRequest()).isNotNull();
    }

    @Test
    @DisplayName("Employee loopback access: Employee is allowed from loopback 127.0.0.1")
    void employeeUser_fromLoopback_shouldPassThrough() throws ServletException, IOException {
        authenticateAs("john.doe", "EMPLOYEE");

        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/v1/dashboard");
        request.setRemoteAddr("127.0.0.1");
        MockHttpServletResponse response = new MockHttpServletResponse();
        MockFilterChain chain = new MockFilterChain();

        filter.doFilter(request, response, chain);

        assertThat(response.getStatus()).isEqualTo(200);
        assertThat(chain.getRequest()).isNotNull();
    }

    @Test
    @DisplayName("Employee public CIDR access: Employee is allowed from configured public CIDR")
    void employeeUser_fromPublicCidr_shouldPassThrough() throws ServletException, IOException {
        authenticateAs("john.doe", "EMPLOYEE");

        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/v1/tasks");
        request.setRemoteAddr("198.51.100.42");
        MockHttpServletResponse response = new MockHttpServletResponse();
        MockFilterChain chain = new MockFilterChain();

        filter.doFilter(request, response, chain);

        assertThat(response.getStatus()).isEqualTo(200);
        assertThat(chain.getRequest()).isNotNull();
    }

    @Test
    @DisplayName("Hardware Wi-Fi secret bypass: Employee with valid X-RD-Wifi-Secret header is allowed from external IP")
    void employeeUser_withValidWifiSecret_shouldPassThrough() throws ServletException, IOException {
        authenticateAs("john.doe", "EMPLOYEE");

        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/v1/attendance/check-in");
        request.setRemoteAddr("203.0.113.99");
        request.addHeader("X-RD-Wifi-Secret", WIFI_SECRET);
        MockHttpServletResponse response = new MockHttpServletResponse();
        MockFilterChain chain = new MockFilterChain();

        filter.doFilter(request, response, chain);

        assertThat(response.getStatus()).isEqualTo(200);
        assertThat(chain.getRequest()).isNotNull();
    }

    @Test
    @DisplayName("Hardware Wi-Fi secret mismatch: Employee with wrong secret header is blocked 403")
    void employeeUser_withInvalidWifiSecret_shouldBeBlocked403() throws ServletException, IOException {
        authenticateAs("john.doe", "EMPLOYEE");

        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/v1/attendance/check-in");
        request.setRemoteAddr("203.0.113.99");
        request.addHeader("X-RD-Wifi-Secret", "invalid-secret");
        MockHttpServletResponse response = new MockHttpServletResponse();
        MockFilterChain chain = new MockFilterChain();

        filter.doFilter(request, response, chain);

        assertThat(response.getStatus()).isEqualTo(403);
        assertThat(chain.getRequest()).isNull();
    }

    @Test
    @DisplayName("Exempt path: Login endpoint passes through regardless of IP or credentials")
    void exemptPath_login_shouldPassThrough() throws ServletException, IOException {
        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/v1/auth/login");
        request.setRemoteAddr("203.0.113.99");
        MockHttpServletResponse response = new MockHttpServletResponse();
        MockFilterChain chain = new MockFilterChain();

        filter.doFilter(request, response, chain);

        assertThat(response.getStatus()).isEqualTo(200);
        assertThat(chain.getRequest()).isNotNull();
    }

    @Test
    @DisplayName("Unauthenticated request to protected path: passes through to Spring Security chain for 401 handling")
    void unauthenticatedUser_protectedPath_passesThrough() throws ServletException, IOException {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/v1/projects");
        request.setRemoteAddr("203.0.113.99");
        MockHttpServletResponse response = new MockHttpServletResponse();
        MockFilterChain chain = new MockFilterChain();

        filter.doFilter(request, response, chain);

        assertThat(response.getStatus()).isEqualTo(200);
        assertThat(chain.getRequest()).isNotNull();
    }
}
