package com.nevolyn.officemanagement.unit;

import com.nevolyn.officemanagement.attendance.entity.Attendance;
import com.nevolyn.officemanagement.attendance.policy.AttendancePolicy;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

import java.time.LocalTime;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Unit tests for {@link AttendancePolicy}.
 *
 * <p>Validates the core business rules from PROJECT_DOCUMENTATION.md §8:
 * <ul>
 *   <li>check-in <= 12:00 → On Time</li>
 *   <li>check-in > 12:00  → Late</li>
 *   <li>check-out < 17:00 → Early Checkout: Yes</li>
 *   <li>check-out >= 17:00 → Early Checkout: No</li>
 * </ul>
 *
 * <p>Mirrors the original Python tests:
 * {@code test_work_start_time_cutoff_rule} and {@code test_attendance_status_badges}.
 */
@DisplayName("AttendancePolicy Unit Tests")
class AttendancePolicyTest {

    private AttendancePolicy policy;

    @BeforeEach
    void setUp() {
        // Default cutoffs: 12:00 check-in, 17:00 check-out
        policy = new AttendancePolicy(12, 0, 17, 0);
    }

    // ── Late Status Tests ───────────────────────────────────────

    @Test
    @DisplayName("Check-in at exactly 12:00 → On Time")
    void checkInAtCutoff_shouldBeOnTime() {
        assertThat(policy.determineLateStatus(LocalTime.of(12, 0)))
                .isEqualTo(Attendance.LateStatus.ON_TIME);
    }

    @Test
    @DisplayName("Check-in one minute before cutoff → On Time")
    void checkInBeforeCutoff_shouldBeOnTime() {
        assertThat(policy.determineLateStatus(LocalTime.of(11, 59)))
                .isEqualTo(Attendance.LateStatus.ON_TIME);
    }

    @Test
    @DisplayName("Check-in one minute after cutoff → Late")
    void checkInAfterCutoff_shouldBeLate() {
        assertThat(policy.determineLateStatus(LocalTime.of(12, 1)))
                .isEqualTo(Attendance.LateStatus.LATE);
    }

    @ParameterizedTest(name = "check-in at {0}:{1} → {2}")
    @CsvSource({
        "9,  0,  ON_TIME",
        "11, 59, ON_TIME",
        "12, 0,  ON_TIME",
        "12, 1,  LATE",
        "13, 0,  LATE",
        "23, 59, LATE"
    })
    @DisplayName("Late status parametrized")
    void lateStatus_parametrized(int hour, int minute, String expectedStatus) {
        Attendance.LateStatus result = policy.determineLateStatus(LocalTime.of(hour, minute));
        assertThat(result.name()).isEqualTo(expectedStatus);
    }

    // ── Early Checkout Tests ────────────────────────────────────

    @Test
    @DisplayName("Check-out at exactly 17:00 → No Early Checkout")
    void checkOutAtCutoff_shouldNotBeEarly() {
        assertThat(policy.determineEarlyCheckout(LocalTime.of(17, 0)))
                .isEqualTo(Attendance.EarlyCheckout.NO);
    }

    @Test
    @DisplayName("Check-out one minute before 17:00 → Early Checkout")
    void checkOutBeforeCutoff_shouldBeEarly() {
        assertThat(policy.determineEarlyCheckout(LocalTime.of(16, 59)))
                .isEqualTo(Attendance.EarlyCheckout.YES);
    }

    @Test
    @DisplayName("Check-out after 17:00 → No Early Checkout")
    void checkOutAfterCutoff_shouldNotBeEarly() {
        assertThat(policy.determineEarlyCheckout(LocalTime.of(18, 0)))
                .isEqualTo(Attendance.EarlyCheckout.NO);
    }

    // ── Working Hours Calculation ───────────────────────────────

    @Test
    @DisplayName("Check-in 12:00, Check-out 17:00 → 5.00 hours")
    void calculateTotalHours_standard() {
        double hours = policy.calculateTotalHours(LocalTime.of(12, 0), LocalTime.of(17, 0));
        assertThat(hours).isEqualTo(5.0);
    }

    @Test
    @DisplayName("Check-in 09:00, Check-out 17:30 → 8.50 hours")
    void calculateTotalHours_withHalfHour() {
        double hours = policy.calculateTotalHours(LocalTime.of(9, 0), LocalTime.of(17, 30));
        assertThat(hours).isEqualTo(8.5);
    }

    @Test
    @DisplayName("Null check-out → 0.0 hours")
    void calculateTotalHours_nullCheckout() {
        double hours = policy.calculateTotalHours(LocalTime.of(12, 0), null);
        assertThat(hours).isEqualTo(0.0);
    }

    // ── Admin Exclusion ─────────────────────────────────────────

    @Test
    @DisplayName("Active user IS eligible for attendance")
    void adminEligibleWhenActive() {
        com.nevolyn.officemanagement.user.entity.User admin =
                com.nevolyn.officemanagement.user.entity.User.builder()
                        .role(com.nevolyn.officemanagement.user.entity.User.UserRole.admin)
                        .isActive(true)
                        .build();
        assertThat(policy.isEligibleForAttendance(admin)).isTrue();
    }

    @Test
    @DisplayName("Employee user IS eligible for attendance")
    void employeeIsEligible() {
        com.nevolyn.officemanagement.user.entity.User employee =
                com.nevolyn.officemanagement.user.entity.User.builder()
                        .role(com.nevolyn.officemanagement.user.entity.User.UserRole.employee)
                        .isActive(true)
                        .build();
        assertThat(policy.isEligibleForAttendance(employee)).isTrue();
    }
}
