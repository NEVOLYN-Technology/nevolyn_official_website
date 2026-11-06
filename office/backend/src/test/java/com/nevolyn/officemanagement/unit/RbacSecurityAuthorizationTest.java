package com.nevolyn.officemanagement.unit;

import com.nevolyn.officemanagement.audit.service.AuditService;
import com.nevolyn.officemanagement.common.exception.BusinessRuleException;
import com.nevolyn.officemanagement.user.dto.CreateUserRequest;
import com.nevolyn.officemanagement.user.dto.ResetPasswordRequest;
import com.nevolyn.officemanagement.user.dto.UpdateUserRequest;
import com.nevolyn.officemanagement.user.dto.UserDto;
import com.nevolyn.officemanagement.user.entity.User;
import com.nevolyn.officemanagement.user.repository.UserRepository;
import com.nevolyn.officemanagement.user.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit tests verifying all RBAC privilege boundaries and security invariants
 * at the service layer.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("RBAC Security & Authorization Boundary Tests")
class RbacSecurityAuthorizationTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuditService auditService;

    @InjectMocks
    private UserService userService;

    private User employeeUser;
    private User adminUser;
    private User superAdmin1;
    private User superAdmin2;

    @BeforeEach
    void setUp() {
        employeeUser = User.builder()
                .id(1L)
                .username("emp1")
                .employeeId("EMP-001")
                .fullName("Employee One")
                .passwordHash("hash")
                .role(User.UserRole.employee)
                .isActive(true)
                .build();

        adminUser = User.builder()
                .id(2L)
                .username("admin1")
                .employeeId("ADM-001")
                .fullName("Admin One")
                .passwordHash("hash")
                .role(User.UserRole.admin)
                .isActive(true)
                .build();

        superAdmin1 = User.builder()
                .id(3L)
                .username("sa1")
                .employeeId("SA-001")
                .fullName("Super Admin One")
                .passwordHash("hash")
                .role(User.UserRole.super_admin)
                .isActive(true)
                .build();

        superAdmin2 = User.builder()
                .id(4L)
                .username("sa2")
                .employeeId("SA-002")
                .fullName("Super Admin Two")
                .passwordHash("hash")
                .role(User.UserRole.super_admin)
                .isActive(true)
                .build();
    }

    @Nested
    @DisplayName("User Creation Privilege Boundaries")
    class CreationTests {

        @Test
        @DisplayName("ADMIN cannot create ADMIN account — throws BusinessRuleException")
        void adminCannotCreateAdmin() {
            CreateUserRequest req = new CreateUserRequest(
                    "ADM-002", "newadmin", "pass123", "New Admin", "Mgr", LocalDate.now(), null, "admin"
            );

            assertThatThrownBy(() -> userService.createUser(req, "127.0.0.1", "admin1", User.UserRole.admin))
                    .isInstanceOf(BusinessRuleException.class)
                    .hasMessageContaining("only a SUPER_ADMIN can provision ADMIN accounts");

            verify(userRepository, never()).save(any());
        }

        @Test
        @DisplayName("Nobody can create SUPER_ADMIN via standard createUser endpoint")
        void standardEndpointBlocksSuperAdminCreation() {
            CreateUserRequest req = new CreateUserRequest(
                    "SA-003", "newsa", "pass123", "New SA", "Founder", LocalDate.now(), null, "super_admin"
            );

            assertThatThrownBy(() -> userService.createUser(req, "127.0.0.1", "sa1", User.UserRole.super_admin))
                    .isInstanceOf(BusinessRuleException.class)
                    .hasMessageContaining("SUPER_ADMIN accounts cannot be created via this endpoint");

            verify(userRepository, never()).save(any());
        }

        @Test
        @DisplayName("SUPER_ADMIN can create ADMIN account")
        void superAdminCanCreateAdmin() {
            CreateUserRequest req = new CreateUserRequest(
                    "ADM-002", "newadmin", "pass123", "New Admin", "Mgr", LocalDate.now(), null, "admin"
            );
            when(userRepository.existsByUsername("newadmin")).thenReturn(false);
            when(userRepository.existsByEmployeeId("ADM-002")).thenReturn(false);
            when(passwordEncoder.encode("pass123")).thenReturn("hashed");
            when(userRepository.save(any(User.class))).thenAnswer(inv -> {
                User u = inv.getArgument(0);
                u.setId(10L);
                return u;
            });

            UserDto result = userService.createUser(req, "127.0.0.1", "sa1", User.UserRole.super_admin);

            assertThat(result).isNotNull();
            assertThat(result.role()).isEqualTo("admin");
            verify(userRepository).save(any(User.class));
        }

        @Test
        @DisplayName("Max 2 active SUPER_ADMIN cap is strictly enforced")
        void maxSuperAdminCapEnforced() {
            CreateUserRequest req = new CreateUserRequest(
                    "SA-003", "sa3", "pass123", "Third Founder", "Founder", LocalDate.now(), null, "super_admin"
            );
            when(userRepository.countByRole(User.UserRole.super_admin)).thenReturn(2L);

            assertThatThrownBy(() -> userService.createSuperAdmin(req, "127.0.0.1", "sa1"))
                    .isInstanceOf(BusinessRuleException.class)
                    .hasMessageContaining("Maximum number of SUPER_ADMIN accounts (2) has been reached");

            verify(userRepository, never()).save(any());
        }
    }

    @Nested
    @DisplayName("User Mutation & Privilege Escalation Prevention")
    class MutationTests {

        @Test
        @DisplayName("ADMIN cannot edit another ADMIN account")
        void adminCannotEditAdmin() {
            when(userRepository.findById(2L)).thenReturn(Optional.of(adminUser));

            UpdateUserRequest req = new UpdateUserRequest("Hacked Admin", "New Role", null, null, null);

            assertThatThrownBy(() -> userService.updateUser(2L, req, "127.0.0.1", "admin1", User.UserRole.admin))
                    .isInstanceOf(BusinessRuleException.class)
                    .hasMessageContaining("ADMINs cannot modify other ADMIN or SUPER_ADMIN accounts");
        }

        @Test
        @DisplayName("ADMIN cannot edit SUPER_ADMIN account")
        void adminCannotEditSuperAdmin() {
            when(userRepository.findById(3L)).thenReturn(Optional.of(superAdmin1));

            UpdateUserRequest req = new UpdateUserRequest("Hacked SA", "New Role", null, null, null);

            assertThatThrownBy(() -> userService.updateUser(3L, req, "127.0.0.1", "admin1", User.UserRole.admin))
                    .isInstanceOf(BusinessRuleException.class)
                    .hasMessageContaining("ADMINs cannot modify other ADMIN or SUPER_ADMIN accounts");
        }

        @Test
        @DisplayName("Normal update endpoint rejects promotion to SUPER_ADMIN")
        void cannotPromoteToSuperAdminViaUpdate() {
            when(userRepository.findById(1L)).thenReturn(Optional.of(employeeUser));

            UpdateUserRequest req = new UpdateUserRequest("Emp Name", null, null, null, "super_admin");

            assertThatThrownBy(() -> userService.updateUser(1L, req, "127.0.0.1", "sa1", User.UserRole.super_admin))
                    .isInstanceOf(BusinessRuleException.class)
                    .hasMessageContaining("Promotion to SUPER_ADMIN is not allowed via the edit endpoint");
        }

        @Test
        @DisplayName("ADMIN cannot promote EMPLOYEE to ADMIN")
        void adminCannotPromoteToAdmin() {
            when(userRepository.findById(1L)).thenReturn(Optional.of(employeeUser));

            UpdateUserRequest req = new UpdateUserRequest("Emp Name", null, null, null, "admin");

            assertThatThrownBy(() -> userService.updateUser(1L, req, "127.0.0.1", "admin1", User.UserRole.admin))
                    .isInstanceOf(BusinessRuleException.class)
                    .hasMessageContaining("only a SUPER_ADMIN can grant ADMIN role");
        }
    }

    @Nested
    @DisplayName("Deactivation & Self-Protection Tests")
    class DeactivationTests {

        @Test
        @DisplayName("SUPER_ADMIN cannot deactivate their own account")
        void superAdminCannotDeactivateSelf() {
            when(userRepository.findById(3L)).thenReturn(Optional.of(superAdmin1));

            assertThatThrownBy(() -> userService.toggleUserStatus(3L, "127.0.0.1", "sa1", User.UserRole.super_admin))
                    .isInstanceOf(BusinessRuleException.class)
                    .hasMessageContaining("SUPER_ADMIN accounts cannot be deactivated");
        }

        @Test
        @DisplayName("SUPER_ADMIN cannot deactivate another SUPER_ADMIN")
        void superAdminCannotDeactivatePeerSuperAdmin() {
            when(userRepository.findById(4L)).thenReturn(Optional.of(superAdmin2));

            assertThatThrownBy(() -> userService.toggleUserStatus(4L, "127.0.0.1", "sa1", User.UserRole.super_admin))
                    .isInstanceOf(BusinessRuleException.class)
                    .hasMessageContaining("SUPER_ADMIN accounts cannot be deactivated");
        }

        @Test
        @DisplayName("ADMIN cannot deactivate another ADMIN")
        void adminCannotDeactivateAdmin() {
            User otherAdmin = User.builder().id(5L).username("admin2").role(User.UserRole.admin).isActive(true).build();
            when(userRepository.findById(5L)).thenReturn(Optional.of(otherAdmin));

            assertThatThrownBy(() -> userService.toggleUserStatus(5L, "127.0.0.1", "admin1", User.UserRole.admin))
                    .isInstanceOf(BusinessRuleException.class)
                    .hasMessageContaining("ADMINs cannot deactivate other ADMIN accounts");
        }
    }

    @Nested
    @DisplayName("Password Reset Privilege Tests")
    class PasswordResetTests {

        @Test
        @DisplayName("SUPER_ADMIN password cannot be reset via normal endpoint")
        void cannotResetSuperAdminPasswordViaEndpoint() {
            when(userRepository.findById(3L)).thenReturn(Optional.of(superAdmin1));

            ResetPasswordRequest req = new ResetPasswordRequest("newSecretPass");

            assertThatThrownBy(() -> userService.resetPassword(3L, req, "127.0.0.1", "sa2", User.UserRole.super_admin))
                    .isInstanceOf(BusinessRuleException.class)
                    .hasMessageContaining("SUPER_ADMIN passwords cannot be reset via this endpoint");
        }

        @Test
        @DisplayName("ADMIN cannot reset another ADMIN's password")
        void adminCannotResetAdminPassword() {
            when(userRepository.findById(2L)).thenReturn(Optional.of(adminUser));

            ResetPasswordRequest req = new ResetPasswordRequest("newSecretPass");

            assertThatThrownBy(() -> userService.resetPassword(2L, req, "127.0.0.1", "admin1", User.UserRole.admin))
                    .isInstanceOf(BusinessRuleException.class)
                    .hasMessageContaining("ADMINs cannot reset other ADMIN account passwords");
        }
    }
}
