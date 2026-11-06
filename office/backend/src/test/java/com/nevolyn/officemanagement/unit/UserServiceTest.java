package com.nevolyn.officemanagement.unit;

import com.nevolyn.officemanagement.audit.service.AuditService;
import com.nevolyn.officemanagement.common.exception.BusinessRuleException;
import com.nevolyn.officemanagement.user.dto.CreateUserRequest;
import com.nevolyn.officemanagement.user.dto.ResetPasswordRequest;
import com.nevolyn.officemanagement.user.dto.UserDto;
import com.nevolyn.officemanagement.user.entity.User;
import com.nevolyn.officemanagement.user.repository.UserRepository;
import com.nevolyn.officemanagement.user.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
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
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("UserService Parity Tests")
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuditService auditService;

    @InjectMocks
    private UserService userService;

    private User sampleUser;

    @BeforeEach
    void setUp() {
        sampleUser = User.builder()
                .id(1L)
                .username("john.doe")
                .employeeId("EMP001")
                .fullName("John Doe")
                .passwordHash("hashed_old_pass")
                .role(User.UserRole.employee)
                .isActive(true)
                .build();
    }

    @Test
    @DisplayName("Create User: Duplicate username throws BusinessRuleException")
    void createUser_duplicateUsername_shouldThrowException() {
        CreateUserRequest req = new CreateUserRequest(
                "EMP002", "john.doe", "password123", "John Two", "Dev", LocalDate.now(), "123456", "employee"
        );
        when(userRepository.existsByUsername("john.doe")).thenReturn(true);

        assertThatThrownBy(() -> userService.createUser(req, "127.0.0.1", "admin", User.UserRole.admin))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("Username 'john.doe' is already taken");

        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("Create User: Duplicate employeeId throws BusinessRuleException")
    void createUser_duplicateEmployeeId_shouldThrowException() {
        CreateUserRequest req = new CreateUserRequest(
                "EMP001", "new.user", "password123", "New User", "Dev", LocalDate.now(), "123456", "employee"
        );
        when(userRepository.existsByUsername("new.user")).thenReturn(false);
        when(userRepository.existsByEmployeeId("EMP001")).thenReturn(true);

        assertThatThrownBy(() -> userService.createUser(req, "127.0.0.1", "admin", User.UserRole.admin))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("Employee ID 'EMP001' is already registered");

        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("Create User: Valid details encodes password and persists user")
    void createUser_valid_shouldEncodePasswordAndSave() {
        CreateUserRequest req = new CreateUserRequest(
                "EMP002", "jane.doe", "plainPassword", "Jane Doe", "Dev", LocalDate.now(), "123456", "employee"
        );
        when(userRepository.existsByUsername("jane.doe")).thenReturn(false);
        when(userRepository.existsByEmployeeId("EMP002")).thenReturn(false);
        when(passwordEncoder.encode("plainPassword")).thenReturn("hashedPassword123");
        when(userRepository.save(any(User.class))).thenAnswer(inv -> {
            User u = inv.getArgument(0);
            u.setId(2L);
            return u;
        });

        UserDto created = userService.createUser(req, "127.0.0.1", "admin", User.UserRole.admin);

        assertThat(created).isNotNull();
        assertThat(created.username()).isEqualTo("jane.doe");
        assertThat(created.employeeId()).isEqualTo("EMP002");
        verify(passwordEncoder).encode("plainPassword");
        verify(auditService).log(any(), eq("admin"), isNull(), eq("127.0.0.1"), eq("users"), eq(2L), any());
    }

    @Test
    @DisplayName("Toggle Status: Flips isActive and logs audit")
    void toggleUserStatus_shouldFlipActiveState() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(sampleUser));
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        UserDto toggled = userService.toggleUserStatus(1L, "127.0.0.1", "admin", User.UserRole.admin);

        assertThat(toggled.isActive()).isFalse();
        verify(auditService).log(any(), eq("admin"), isNull(), eq("127.0.0.1"), eq("users"), eq(1L), contains("Deactivated"));
    }

    @Test
    @DisplayName("Admin Reset Password: Encodes new password and saves")
    void resetPassword_shouldEncodeAndSave() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(sampleUser));
        when(passwordEncoder.encode("newSecretPass")).thenReturn("hashed_new_pass");

        userService.resetPassword(1L, new ResetPasswordRequest("newSecretPass"), "127.0.0.1", "admin", User.UserRole.admin);

        assertThat(sampleUser.getPasswordHash()).isEqualTo("hashed_new_pass");
        verify(userRepository).save(sampleUser);
    }

    @Test
    @DisplayName("Self Password Change: Incorrect current password throws exception")
    void changeSelfPassword_incorrectCurrent_shouldThrowException() {
        when(userRepository.findByUsername("john.doe")).thenReturn(Optional.of(sampleUser));
        when(passwordEncoder.matches("wrongPass", "hashed_old_pass")).thenReturn(false);

        assertThatThrownBy(() -> userService.changeSelfPassword("john.doe", "wrongPass", "newSecret123", "127.0.0.1"))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("Incorrect current password");
    }

    @Test
    @DisplayName("Self Password Change: Password shorter than 6 characters throws exception")
    void changeSelfPassword_tooShort_shouldThrowException() {
        when(userRepository.findByUsername("john.doe")).thenReturn(Optional.of(sampleUser));
        when(passwordEncoder.matches("correctPass", "hashed_old_pass")).thenReturn(true);

        assertThatThrownBy(() -> userService.changeSelfPassword("john.doe", "correctPass", "12345", "127.0.0.1"))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("at least 6 characters long");
    }
}
