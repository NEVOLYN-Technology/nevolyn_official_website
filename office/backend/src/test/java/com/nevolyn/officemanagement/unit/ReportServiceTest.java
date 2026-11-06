package com.nevolyn.officemanagement.unit;

import com.nevolyn.officemanagement.attendance.entity.Attendance;
import com.nevolyn.officemanagement.attendance.repository.AttendanceRepository;
import com.nevolyn.officemanagement.development.repository.DevelopmentRecordRepository;
import com.nevolyn.officemanagement.experiment.repository.ExperimentRepository;
import com.nevolyn.officemanagement.file.repository.UploadedFileRepository;
import com.nevolyn.officemanagement.project.repository.RndProjectRepository;
import com.nevolyn.officemanagement.report.dto.MonthlyAttendanceReportDto;
import com.nevolyn.officemanagement.report.service.ReportService;
import com.nevolyn.officemanagement.task.repository.TaskRepository;
import com.nevolyn.officemanagement.training.repository.TrainingMeetingRepository;
import com.nevolyn.officemanagement.user.entity.User;
import com.nevolyn.officemanagement.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("ReportService Monthly Parity Tests")
class ReportServiceTest {

    @Mock
    private AttendanceRepository attendanceRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private TaskRepository taskRepository;
    @Mock
    private RndProjectRepository projectRepository;
    @Mock
    private ExperimentRepository experimentRepository;
    @Mock
    private DevelopmentRecordRepository developmentRecordRepository;
    @Mock
    private UploadedFileRepository fileRepository;
    @Mock
    private TrainingMeetingRepository trainingRepository;

    @InjectMocks
    private ReportService reportService;

    private User employee1;
    private User employee2;

    @BeforeEach
    void setUp() {
        employee1 = User.builder()
                .id(1L)
                .username("john.doe")
                .employeeId("EMP001")
                .fullName("John Doe")
                .designation("Software Engineer")
                .role(User.UserRole.employee)
                .isActive(true)
                .build();

        employee2 = User.builder()
                .id(2L)
                .username("jane.smith")
                .employeeId("EMP002")
                .fullName("Jane Smith")
                .designation("Senior Scientist")
                .role(User.UserRole.employee)
                .isActive(true)
                .build();
    }

    @Test
    @DisplayName("Pre-system month: Months before September 2026 return 0 elapsed days")
    void getMonthlyAttendanceReport_preSystemMonth_elapsedDaysShouldBeZero() {
        MonthlyAttendanceReportDto report = reportService.getMonthlyAttendanceReport("2026-08");

        assertThat(report.month()).isEqualTo("2026-08");
        assertThat(report.elapsedDays()).isEqualTo(0);
    }

    @Test
    @DisplayName("September 2026 anchor month: Calculations aggregate present, late, absent, and hours")
    void getMonthlyAttendanceReport_september2026_aggregatesCorrectly() {
        when(userRepository.findByIsActiveTrueOrderByFullNameAsc())
                .thenReturn(List.of(employee1, employee2));

        Attendance a1 = Attendance.builder()
                .id(101L)
                .user(employee1)
                .date(LocalDate.of(2026, 9, 1))
                .status(Attendance.AttendanceStatus.PRESENT)
                .lateStatus(Attendance.LateStatus.ON_TIME)
                .totalHours(BigDecimal.valueOf(8.5))
                .build();

        Attendance a2 = Attendance.builder()
                .id(102L)
                .user(employee1)
                .date(LocalDate.of(2026, 9, 2))
                .status(Attendance.AttendanceStatus.PRESENT)
                .lateStatus(Attendance.LateStatus.LATE)
                .totalHours(BigDecimal.valueOf(7.0))
                .build();

        when(attendanceRepository.findAllByDateBetweenForEmployees(any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(List.of(a1, a2));

        MonthlyAttendanceReportDto report = reportService.getMonthlyAttendanceReport("2026-09");

        assertThat(report.employees()).hasSize(2);

        MonthlyAttendanceReportDto.EmployeeAttendanceSummary summary1 = report.employees().stream()
                .filter(e -> e.userId().equals(1L))
                .findFirst().orElseThrow();

        assertThat(summary1.presentDays()).isEqualTo(2);
        assertThat(summary1.lateDays()).isEqualTo(1);
        assertThat(summary1.totalHours()).isEqualByComparingTo(BigDecimal.valueOf(15.5));
        assertThat(summary1.absentDays()).isEqualTo(Math.max(report.elapsedDays() - 2, 0));

        MonthlyAttendanceReportDto.EmployeeAttendanceSummary summary2 = report.employees().stream()
                .filter(e -> e.userId().equals(2L))
                .findFirst().orElseThrow();

        assertThat(summary2.presentDays()).isEqualTo(0);
        assertThat(summary2.lateDays()).isEqualTo(0);
        assertThat(summary2.absentDays()).isEqualTo(report.elapsedDays());
    }
}
