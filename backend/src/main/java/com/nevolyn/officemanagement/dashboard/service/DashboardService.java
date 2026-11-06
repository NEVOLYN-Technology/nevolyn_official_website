package com.nevolyn.officemanagement.dashboard.service;

import com.nevolyn.officemanagement.attendance.dto.AdminAttendanceRecordDto;
import com.nevolyn.officemanagement.attendance.dto.AttendanceResponse;
import com.nevolyn.officemanagement.attendance.entity.Attendance;
import com.nevolyn.officemanagement.attendance.repository.AttendanceRepository;
import com.nevolyn.officemanagement.attendance.service.AttendanceService;
import com.nevolyn.officemanagement.audit.dto.AuditLogDto;
import com.nevolyn.officemanagement.audit.repository.AuditLogRepository;
import com.nevolyn.officemanagement.common.exception.ResourceNotFoundException;
import com.nevolyn.officemanagement.dashboard.dto.AdminDashboardDto;
import com.nevolyn.officemanagement.dashboard.dto.EmployeeDashboardDto;
import com.nevolyn.officemanagement.project.dto.ProjectDto;
import com.nevolyn.officemanagement.project.entity.RndProject;
import com.nevolyn.officemanagement.project.repository.RndProjectRepository;
import com.nevolyn.officemanagement.task.dto.TaskDto;
import com.nevolyn.officemanagement.task.entity.Task;
import com.nevolyn.officemanagement.task.repository.TaskRepository;
import com.nevolyn.officemanagement.user.entity.User;
import com.nevolyn.officemanagement.user.repository.UserRepository;
import com.nevolyn.officemanagement.worklog.dto.WorkLogDto;
import com.nevolyn.officemanagement.worklog.repository.WorkLogRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

// Aggregation and analytics service for executive and employee dashboard views.
@Service
public class DashboardService {

    private static final Logger log = LoggerFactory.getLogger(DashboardService.class);

    private final UserRepository userRepository;
    private final AttendanceRepository attendanceRepository;
    private final AttendanceService attendanceService;
    private final RndProjectRepository projectRepository;
    private final TaskRepository taskRepository;
    private final WorkLogRepository workLogRepository;
    private final AuditLogRepository auditLogRepository;

    public DashboardService(
            UserRepository userRepository,
            AttendanceRepository attendanceRepository,
            AttendanceService attendanceService,
            RndProjectRepository projectRepository,
            TaskRepository taskRepository,
            WorkLogRepository workLogRepository,
            AuditLogRepository auditLogRepository
    ) {
        this.userRepository = userRepository;
        this.attendanceRepository = attendanceRepository;
        this.attendanceService = attendanceService;
        this.projectRepository = projectRepository;
        this.taskRepository = taskRepository;
        this.workLogRepository = workLogRepository;
        this.auditLogRepository = auditLogRepository;
    }

    // Compiles organizational KPIs and real-time operational status for administrators.
    @Transactional(readOnly = true)
    public AdminDashboardDto getAdminDashboard() {
        LocalDate today = LocalDate.now();

        long totalEmployees = userRepository.countActiveEmployees();
        List<Attendance> todayRecords = attendanceRepository.findAllByDateWithUser(today);

        long presentToday = todayRecords.stream()
                .filter(a -> a.getStatus() == Attendance.AttendanceStatus.PRESENT)
                .count();

        long lateToday = todayRecords.stream()
                .filter(a -> a.getLateStatus() == Attendance.LateStatus.LATE)
                .count();

        long currentlyInside = attendanceRepository.countInHouseOnDate(today);
        long absentToday = Math.max(totalEmployees - presentToday, 0);

        long activeProjects = projectRepository.countByStatusIn(List.of(
                RndProject.ProjectStatus.PENDING,
                RndProject.ProjectStatus.IN_PROGRESS
        ));

        long pendingTasks = taskRepository.countByStatusIn(List.of(
                Task.TaskStatus.PENDING,
                Task.TaskStatus.IN_PROGRESS
        ));

        long completedTasks = taskRepository.countByStatus(Task.TaskStatus.COMPLETED);

        List<AdminAttendanceRecordDto> todayAttendance = attendanceService.getAdminDailyAttendance(today);

        List<AuditLogDto> recentAudits = auditLogRepository.findAllByOrderByCreatedAtDesc(PageRequest.of(0, 10))
                .getContent().stream()
                .map(AuditLogDto::fromEntity)
                .toList();

        return AdminDashboardDto.builder()
                .totalEmployees(totalEmployees)
                .presentToday(presentToday)
                .lateToday(lateToday)
                .currentlyInside(currentlyInside)
                .absentToday(absentToday)
                .activeProjects(activeProjects)
                .pendingTasks(pendingTasks)
                .completedTasks(completedTasks)
                .todayAttendance(todayAttendance)
                .recentAuditLogs(recentAudits)
                .build();
    }

    // Compiles a personalized workspace summary for the specified employee.
    @Transactional(readOnly = true)
    public EmployeeDashboardDto getEmployeeDashboard(String username) {
        String normalized = username != null ? username.trim() : "";
        User user = userRepository.findByUsername(normalized.toLowerCase())
                .or(() -> userRepository.findByUsername(normalized))
                .or(() -> userRepository.findByEmployeeId(normalized.toLowerCase()))
                .or(() -> userRepository.findByEmployeeId(normalized))
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        int hour = LocalTime.now().getHour();
        String greeting;
        if (hour < 12) {
            greeting = "Good Morning";
        } else if (hour < 18) {
            greeting = "Good Afternoon";
        } else {
            greeting = "Good Evening";
        }

        AttendanceResponse todayAttendance = null;
        try {
            todayAttendance = attendanceRepository.findByUserIdAndDate(user.getId(), LocalDate.now())
                    .map(AttendanceResponse::from)
                    .orElse(null);
        } catch (Exception ex) {
            log.warn("Could not load today's attendance for '{}': {}", user.getUsername(), ex.getMessage());
        }

        List<TaskDto> myTasks = List.of();
        try {
            myTasks = taskRepository.findTop5ByAssignedToIdAndStatusInOrderByDeadlineAsc(
                    user.getId(),
                    List.of(Task.TaskStatus.PENDING, Task.TaskStatus.IN_PROGRESS)
            ).stream().map(TaskDto::fromEntity).toList();
        } catch (Exception ex) {
            log.warn("Could not load active tasks for '{}': {}", user.getUsername(), ex.getMessage());
        }

        List<ProjectDto> myProjects = List.of();
        try {
            myProjects = projectRepository.findTop5ByResponsibleIdAndStatusInOrderByTargetDateAsc(
                    user.getId(),
                    List.of(RndProject.ProjectStatus.PENDING, RndProject.ProjectStatus.IN_PROGRESS)
            ).stream().map(ProjectDto::fromEntity).toList();
        } catch (Exception ex) {
            log.warn("Could not load active projects for '{}': {}", user.getUsername(), ex.getMessage());
        }

        List<WorkLogDto> myLogs = List.of();
        try {
            myLogs = workLogRepository.findTop5ByUserIdOrderByLogDateDescSubmittedAtDesc(user.getId())
                    .stream().map(WorkLogDto::fromEntity).toList();
        } catch (Exception ex) {
            log.warn("Could not load recent work logs for '{}': {}", user.getUsername(), ex.getMessage());
        }

        return EmployeeDashboardDto.builder()
                .greeting(greeting)
                .fullName(user.getFullName())
                .designation(user.getDesignation())
                .employeeId(user.getEmployeeId())
                .todayAttendance(todayAttendance)
                .myTasks(myTasks)
                .myProjects(myProjects)
                .myWorkLogs(myLogs)
                .build();
    }

    @Transactional(readOnly = true)
    public EmployeeDashboardDto getEmployeeDashboardForCaller(String targetUsername, String callerUsername) {
        String callerNorm = callerUsername != null ? callerUsername.trim() : "";
        String targetNorm = targetUsername != null ? targetUsername.trim() : "";

        User caller = userRepository.findByUsername(callerNorm.toLowerCase())
                .or(() -> userRepository.findByUsername(callerNorm))
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", callerUsername));
        User target = userRepository.findByUsername(targetNorm.toLowerCase())
                .or(() -> userRepository.findByUsername(targetNorm))
                .or(() -> userRepository.findByEmployeeId(targetNorm.toLowerCase()))
                .or(() -> userRepository.findByEmployeeId(targetNorm))
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", targetUsername));

        boolean isSelf = caller.getId().equals(target.getId());
        if (!isSelf && !caller.isSuperAdmin() && target.isSuperAdmin()) {
            throw new org.springframework.security.access.AccessDeniedException(
                    "Admins cannot inspect Super Admin workspaces.");
        }

        return getEmployeeDashboard(target.getUsername());
    }
}
