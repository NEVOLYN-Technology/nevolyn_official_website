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
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

/**
 * Aggregation and analytics service for executive and employee dashboard views.
 *
 * <p>Coordinates multi-domain operational metrics including workforce attendance,
 * project milestones, task delivery backlogs, and real-time security audit trails
 * without triggering transactional locks on high-velocity transactional tables.</p>
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class DashboardService {

    private final UserRepository userRepository;
    private final AttendanceRepository attendanceRepository;
    private final AttendanceService attendanceService;
    private final RndProjectRepository projectRepository;
    private final TaskRepository taskRepository;
    private final WorkLogRepository workLogRepository;
    private final AuditLogRepository auditLogRepository;

    /**
     * Compiles organizational KPIs and real-time operational status for administrators.
     *
     * <p>Gathers headcount metrics, today's attendance snapshot (present, late, absent,
     * currently in-house), project status distributions, task execution backlogs,
     * full employee daily roster, and the latest 10 security audit log events.</p>
     *
     * @return an {@link AdminDashboardDto} containing aggregated company-wide metrics
     */
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

    /**
     * Compiles a personalized workspace summary for the specified employee.
     *
     * <p>Includes time-appropriate greetings, today's attendance status,
     * the top 5 urgent active tasks assigned to the employee, top 5 active projects
     * where the user is responsible, and the most recent 5 submitted work log journals.</p>
     *
     * @param username the username of the employee requesting their dashboard overview
     * @return an {@link EmployeeDashboardDto} populated with user-specific work items
     * @throws ResourceNotFoundException if no user matching {@code username} exists
     */
    @Transactional(readOnly = true)
    public EmployeeDashboardDto getEmployeeDashboard(String username) {
        User user = userRepository.findByUsername(username)
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

        AttendanceResponse todayAttendance = attendanceRepository.findByUserIdAndDate(user.getId(), LocalDate.now())
                .map(AttendanceResponse::from)
                .orElse(null);

        List<TaskDto> myTasks = taskRepository.findTop5ByAssignedToIdAndStatusInOrderByDeadlineAsc(
                user.getId(),
                List.of(Task.TaskStatus.PENDING, Task.TaskStatus.IN_PROGRESS)
        ).stream().map(TaskDto::fromEntity).toList();

        List<ProjectDto> myProjects = projectRepository.findTop5ByResponsibleIdAndStatusInOrderByTargetDateAsc(
                user.getId(),
                List.of(RndProject.ProjectStatus.PENDING, RndProject.ProjectStatus.IN_PROGRESS)
        ).stream().map(ProjectDto::fromEntity).toList();

        List<WorkLogDto> myLogs = workLogRepository.findTop5ByUserIdOrderByLogDateDescSubmittedAtDesc(user.getId())
                .stream().map(WorkLogDto::fromEntity).toList();

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

    /**
     * Compiles a staff member's personalized workspace summary for an administrator.
     *
     * <p>Privilege enforcement:
     * <ul>
     *   <li>SUPER_ADMIN can view anyone's dashboard (super_admin, admin, employee).</li>
     *   <li>ADMIN can view employee dashboards only (forbidden to inspect other admins or super_admins).</li>
     * </ul>
     *
     * @param targetUsername the username of the staff member whose dashboard is requested
     * @param callerUsername the username of the inspecting administrator
     * @return an {@link EmployeeDashboardDto} populated with the target's work items
     */
    @Transactional(readOnly = true)
    public EmployeeDashboardDto getEmployeeDashboardForCaller(String targetUsername, String callerUsername) {
        User caller = userRepository.findByUsername(callerUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", callerUsername));
        User target = userRepository.findByUsername(targetUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", targetUsername));

        if (!caller.isSuperAdmin() && (target.isSuperAdmin() || target.isAdmin())) {
            throw new org.springframework.security.access.AccessDeniedException(
                    "Admins can only inspect employee dashboards, not other administrators.");
        }

        return getEmployeeDashboard(targetUsername);
    }
}
