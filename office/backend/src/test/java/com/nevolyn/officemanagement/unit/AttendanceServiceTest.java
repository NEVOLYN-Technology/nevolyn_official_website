package com.nevolyn.officemanagement.unit;

import com.nevolyn.officemanagement.attendance.dto.AttendanceCorrectionRequest;
import com.nevolyn.officemanagement.attendance.entity.Attendance;
import com.nevolyn.officemanagement.attendance.policy.AttendancePolicy;
import com.nevolyn.officemanagement.attendance.repository.AttendanceRepository;
import com.nevolyn.officemanagement.attendance.service.AttendanceService;
import com.nevolyn.officemanagement.audit.entity.AuditLog;
import com.nevolyn.officemanagement.audit.repository.AuditLogRepository;
import com.nevolyn.officemanagement.common.exception.BusinessRuleException;
import com.nevolyn.officemanagement.user.entity.User;
import com.nevolyn.officemanagement.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AttendanceService Business Rule Parity Tests")
class AttendanceServiceTest {

    @Mock
    private AttendanceRepository attendanceRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private AttendancePolicy attendancePolicy;

    @Mock
    private AuditLogRepository auditLogRepository;

    @InjectMocks
    private AttendanceService attendanceService;

    private User employee;
    private User admin;

    @BeforeEach
    void setUp() {
        employee = User.builder()
                .id(1L)
                .username("john.doe")
                .employeeId("EMP001")
                .fullName("John Doe")
                .role(User.UserRole.employee)
                .isActive(true)
                .build();

        admin = User.builder()
                .id(2L)
                .username("admin")
                .employeeId("ADM001")
                .fullName("System Administrator")
                .role(User.UserRole.admin)
                .isActive(true)
                .build();
    }

    @Test
    @DisplayName("Admin exclusion: Admin cannot check in")
    void adminCheckIn_shouldThrowBusinessRuleException() {
        when(userRepository.findByUsername("admin")).thenReturn(Optional.of(admin));
        when(attendancePolicy.isEligibleForAttendance(admin)).thenReturn(false);

        assertThatThrownBy(() -> attendanceService.checkIn("admin", "127.0.0.1", "Mozilla/5.0"))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("Administrators are not eligible for attendance check-in");

        verify(attendanceRepository, never()).save(any());
    }

    @Test
    @DisplayName("Duplicate check-in: Employee cannot check in twice on the same day")
    void duplicateCheckIn_shouldThrowBusinessRuleException() {
        when(userRepository.findByUsername("john.doe")).thenReturn(Optional.of(employee));
        when(attendancePolicy.isEligibleForAttendance(employee)).thenReturn(true);

        Attendance existing = Attendance.builder()
                .id(10L)
                .user(employee)
                .date(LocalDate.now())
                .checkInTime(LocalTime.of(9, 30))
                .status(Attendance.AttendanceStatus.PRESENT)
                .build();
        when(attendanceRepository.findByUserIdAndDate(eq(employee.getId()), any(LocalDate.class)))
                .thenReturn(Optional.of(existing));

        assertThatThrownBy(() -> attendanceService.checkIn("john.doe", "127.0.0.1", "Mozilla/5.0"))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("You have already checked in today");

        verify(attendanceRepository, never()).save(any());
    }

    @Test
    @DisplayName("Valid check-in: Employee check-in persists record and logs audit trail")
    void validCheckIn_shouldPersistAndAudit() {
        when(userRepository.findByUsername("john.doe")).thenReturn(Optional.of(employee));
        when(attendancePolicy.isEligibleForAttendance(employee)).thenReturn(true);
        when(attendanceRepository.findByUserIdAndDate(eq(employee.getId()), any(LocalDate.class)))
                .thenReturn(Optional.empty());
        when(attendancePolicy.determineLateStatus(any(LocalTime.class)))
                .thenReturn(Attendance.LateStatus.ON_TIME);

        when(attendanceRepository.save(any(Attendance.class))).thenAnswer(inv -> {
            Attendance a = inv.getArgument(0);
            a.setId(100L);
            return a;
        });

        Attendance result = attendanceService.checkIn("john.doe", "192.168.68.50", "Mozilla/5.0");

        assertThat(result).isNotNull();
        assertThat(result.getUser().getUsername()).isEqualTo("john.doe");
        assertThat(result.getLateStatus()).isEqualTo(Attendance.LateStatus.ON_TIME);
        assertThat(result.getStatus()).isEqualTo(Attendance.AttendanceStatus.PRESENT);

        verify(auditLogRepository).save(any(AuditLog.class));
    }

    @Test
    @DisplayName("Admin exclusion: Admin cannot check out")
    void adminCheckOut_shouldThrowBusinessRuleException() {
        when(userRepository.findByUsername("admin")).thenReturn(Optional.of(admin));
        when(attendancePolicy.isEligibleForAttendance(admin)).thenReturn(false);

        assertThatThrownBy(() -> attendanceService.checkOut("admin", "127.0.0.1"))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("Administrators are not eligible for attendance check-out");
    }

    @Test
    @DisplayName("Check-out guard: Cannot check out without having checked in first")
    void checkOutWithoutCheckIn_shouldThrowBusinessRuleException() {
        when(userRepository.findByUsername("john.doe")).thenReturn(Optional.of(employee));
        when(attendancePolicy.isEligibleForAttendance(employee)).thenReturn(true);
        when(attendanceRepository.findByUserIdAndDate(eq(employee.getId()), any(LocalDate.class)))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> attendanceService.checkOut("john.doe", "127.0.0.1"))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("You have not checked in today");
    }

    @Test
    @DisplayName("Check-out guard: Cannot check out twice")
    void duplicateCheckOut_shouldThrowBusinessRuleException() {
        when(userRepository.findByUsername("john.doe")).thenReturn(Optional.of(employee));
        when(attendancePolicy.isEligibleForAttendance(employee)).thenReturn(true);

        Attendance checkedOut = Attendance.builder()
                .id(10L)
                .user(employee)
                .date(LocalDate.now())
                .checkInTime(LocalTime.of(9, 0))
                .checkOutTime(LocalTime.of(17, 30))
                .build();
        when(attendanceRepository.findByUserIdAndDate(eq(employee.getId()), any(LocalDate.class)))
                .thenReturn(Optional.of(checkedOut));

        assertThatThrownBy(() -> attendanceService.checkOut("john.doe", "127.0.0.1"))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("You have already checked out today");
    }

    @Test
    @DisplayName("Valid check-out: Calculates working hours, punctuality badges, and logs audit")
    void validCheckOut_shouldCalculateHoursAndAudit() {
        when(userRepository.findByUsername("john.doe")).thenReturn(Optional.of(employee));
        when(attendancePolicy.isEligibleForAttendance(employee)).thenReturn(true);

        Attendance checkedIn = Attendance.builder()
                .id(10L)
                .user(employee)
                .date(LocalDate.now())
                .checkInTime(LocalTime.of(9, 0))
                .lateStatus(Attendance.LateStatus.ON_TIME)
                .build();
        when(attendanceRepository.findByUserIdAndDate(eq(employee.getId()), any(LocalDate.class)))
                .thenReturn(Optional.of(checkedIn));

        when(attendancePolicy.determineEarlyCheckout(any(LocalTime.class)))
                .thenReturn(Attendance.EarlyCheckout.NO);
        when(attendancePolicy.calculateTotalHours(eq(LocalTime.of(9, 0)), any(LocalTime.class)))
                .thenReturn(8.0);
        when(attendanceRepository.save(any(Attendance.class))).thenAnswer(inv -> inv.getArgument(0));

        Attendance result = attendanceService.checkOut("john.doe", "127.0.0.1");

        assertThat(result.getCheckOutTime()).isNotNull();
        assertThat(result.getEarlyCheckout()).isEqualTo(Attendance.EarlyCheckout.NO);
        assertThat(result.getTotalHours()).isEqualByComparingTo(new BigDecimal("8.00"));

        verify(auditLogRepository).save(any(AuditLog.class));
    }

    @Test
    @DisplayName("Admin correction: Requires mandatory non-empty reason")
    void adminCorrection_withoutReason_shouldThrowBusinessRuleException() {
        AttendanceCorrectionRequest request = new AttendanceCorrectionRequest(
                1L, LocalDate.of(2026, 9, 5), LocalTime.of(9, 0), LocalTime.of(17, 0), "PRESENT", ""
        );

        assertThatThrownBy(() -> attendanceService.correctAttendance(request, "admin", "127.0.0.1"))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("A non-empty correction reason is strictly required");
    }

    @Test
    @DisplayName("Admin correction: Cannot record attendance for administrator")
    void adminCorrection_onAdmin_shouldThrowBusinessRuleException() {
        when(userRepository.findById(2L)).thenReturn(Optional.of(admin));
        when(attendancePolicy.isEligibleForAttendance(admin)).thenReturn(false);

        AttendanceCorrectionRequest request = new AttendanceCorrectionRequest(
                2L, LocalDate.of(2026, 9, 5), LocalTime.of(9, 0), LocalTime.of(17, 0), "PRESENT", "Override test"
        );

        assertThatThrownBy(() -> attendanceService.correctAttendance(request, "admin", "127.0.0.1"))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("Attendance cannot be recorded for administrators");
    }

    @Test
    @DisplayName("Admin correction: Successfully corrects record, attaches audit notes and creates audit log")
    void adminCorrection_valid_shouldUpdateRecordWithNotesAndAudit() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(employee));
        when(attendancePolicy.isEligibleForAttendance(employee)).thenReturn(true);
        when(attendanceRepository.findByUserIdAndDate(1L, LocalDate.of(2026, 9, 5)))
                .thenReturn(Optional.empty());

        when(attendancePolicy.determineLateStatus(LocalTime.of(10, 0))).thenReturn(Attendance.LateStatus.ON_TIME);
        when(attendancePolicy.determineEarlyCheckout(LocalTime.of(18, 0))).thenReturn(Attendance.EarlyCheckout.NO);
        when(attendancePolicy.calculateTotalHours(LocalTime.of(10, 0), LocalTime.of(18, 0))).thenReturn(8.0);
        when(attendanceRepository.save(any(Attendance.class))).thenAnswer(inv -> inv.getArgument(0));

        AttendanceCorrectionRequest request = new AttendanceCorrectionRequest(
                1L, LocalDate.of(2026, 9, 5), LocalTime.of(10, 0), LocalTime.of(18, 0), "PRESENT", "Forgot badge"
        );

        Attendance corrected = attendanceService.correctAttendance(request, "admin", "127.0.0.1");

        assertThat(corrected).isNotNull();
        assertThat(corrected.getNotes()).isEqualTo("Corrected by admin: Forgot badge");
        assertThat(corrected.getTotalHours()).isEqualByComparingTo(new BigDecimal("8.00"));

        ArgumentCaptor<AuditLog> captor = ArgumentCaptor.forClass(AuditLog.class);
        verify(auditLogRepository).save(captor.capture());
        assertThat(captor.getValue().getAction()).isEqualTo(AuditLog.ACTION_ATTENDANCE_CORRECT);
        assertThat(captor.getValue().getDetails()).contains("Forgot badge");
    }
}
