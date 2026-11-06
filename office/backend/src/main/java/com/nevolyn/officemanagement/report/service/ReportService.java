package com.nevolyn.officemanagement.report.service;

import com.nevolyn.officemanagement.attendance.entity.Attendance;
import com.nevolyn.officemanagement.attendance.repository.AttendanceRepository;
import com.nevolyn.officemanagement.development.repository.DevelopmentRecordRepository;
import com.nevolyn.officemanagement.experiment.repository.ExperimentRepository;
import com.nevolyn.officemanagement.file.entity.UploadedFile;
import com.nevolyn.officemanagement.file.repository.UploadedFileRepository;
import com.nevolyn.officemanagement.project.entity.RndProject;
import com.nevolyn.officemanagement.project.repository.RndProjectRepository;
import com.nevolyn.officemanagement.report.dto.MonthlyAttendanceReportDto;
import com.nevolyn.officemanagement.report.dto.ReportSummaryDto;
import com.nevolyn.officemanagement.report.dto.RndReportDto;
import com.nevolyn.officemanagement.report.dto.TasksReportDto;
import com.nevolyn.officemanagement.task.entity.Task;
import com.nevolyn.officemanagement.task.repository.TaskRepository;
import com.nevolyn.officemanagement.training.repository.TrainingMeetingRepository;
import com.nevolyn.officemanagement.user.entity.User;
import com.nevolyn.officemanagement.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Analytics and reporting service generating management reports, workforce summaries,
 * and operational health metrics.
 *
 * <p>Produces multi-dimensional aggregates across attendance compliance, task burndown rates,
 * and research & development portfolio performance.</p>
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ReportService {

    private final AttendanceRepository attendanceRepository;
    private final UserRepository userRepository;
    private final TaskRepository taskRepository;
    private final RndProjectRepository projectRepository;
    private final ExperimentRepository experimentRepository;
    private final DevelopmentRecordRepository developmentRecordRepository;
    private final UploadedFileRepository fileRepository;
    private final TrainingMeetingRepository trainingRepository;

    private static final YearMonth SYSTEM_START_MONTH = YearMonth.of(2026, 9);

    /**
     * Generates a monthly attendance summary across all active employees.
     *
     * <p>Calculates present days, late arrivals, absent days (accounting for month elapsed days),
     * and cumulative working hours per employee.</p>
     *
     * @param monthStr the target year-month in {@code YYYY-MM} format (defaults to current month if null/blank)
     * @return a {@link MonthlyAttendanceReportDto} containing the workforce attendance breakdown
     */
    @Transactional(readOnly = true)
    public MonthlyAttendanceReportDto getMonthlyAttendanceReport(String monthStr) {
        YearMonth targetMonth;
        if (monthStr == null || monthStr.isBlank()) {
            targetMonth = YearMonth.now();
        } else {
            try {
                targetMonth = YearMonth.parse(monthStr);
            } catch (Exception e) {
                targetMonth = YearMonth.now();
            }
        }

        YearMonth currentMonth = YearMonth.now();
        int elapsedDays;
        if (targetMonth.isBefore(SYSTEM_START_MONTH)) {
            elapsedDays = 0;
        } else if (targetMonth.equals(currentMonth)) {
            elapsedDays = LocalDate.now().getDayOfMonth();
        } else if (targetMonth.isBefore(currentMonth)) {
            elapsedDays = targetMonth.lengthOfMonth();
        } else {
            elapsedDays = 0;
        }

        LocalDate startDate = targetMonth.atDay(1);
        LocalDate endDate = targetMonth.atEndOfMonth();

        List<User> employees = userRepository.findByIsActiveTrueOrderByFullNameAsc();
        List<Attendance> records = attendanceRepository.findAllByDateBetweenForEmployees(startDate, endDate);

        Map<Long, List<Attendance>> recordsByUser = records.stream()
                .collect(Collectors.groupingBy(a -> a.getUser().getId()));

        int finalElapsedDays = elapsedDays;
        List<MonthlyAttendanceReportDto.EmployeeAttendanceSummary> summaries = employees.stream().map(emp -> {
            List<Attendance> userRecords = recordsByUser.getOrDefault(emp.getId(), List.of());

            long presentCount = userRecords.stream()
                    .filter(a -> a.getStatus() == Attendance.AttendanceStatus.PRESENT)
                    .count();

            long lateCount = userRecords.stream()
                    .filter(a -> a.getLateStatus() == Attendance.LateStatus.LATE)
                    .count();

            long absentCount = Math.max(finalElapsedDays - presentCount, 0);

            BigDecimal totalHours = userRecords.stream()
                    .map(a -> a.getTotalHours() != null ? a.getTotalHours() : BigDecimal.ZERO)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            return MonthlyAttendanceReportDto.EmployeeAttendanceSummary.builder()
                    .userId(emp.getId())
                    .employeeId(emp.getEmployeeId())
                    .fullName(emp.getFullName())
                    .designation(emp.getDesignation())
                    .presentDays(presentCount)
                    .lateDays(lateCount)
                    .absentDays(absentCount)
                    .totalHours(totalHours)
                    .build();
        }).toList();

        return MonthlyAttendanceReportDto.builder()
                .month(targetMonth.toString())
                .elapsedDays(elapsedDays)
                .employees(summaries)
                .build();
    }

    /**
     * Compiles organizational task metrics, distribution by priority and status, and assignee loads.
     *
     * @return a {@link TasksReportDto} containing company-wide task breakdown
     */
    @Transactional(readOnly = true)
    public TasksReportDto getTasksReport() {
        List<Task> allTasks = taskRepository.findAll();
        List<User> employees = userRepository.findByIsActiveTrueOrderByFullNameAsc();

        Map<String, Long> countByStatus = allTasks.stream()
                .collect(Collectors.groupingBy(t -> t.getStatus().name(), Collectors.counting()));

        Map<String, Long> countByPriority = allTasks.stream()
                .collect(Collectors.groupingBy(t -> t.getPriority().name(), Collectors.counting()));

        Map<Long, List<Task>> tasksByAssignee = allTasks.stream()
                .collect(Collectors.groupingBy(t -> t.getAssignedTo().getId()));

        List<TasksReportDto.EmployeeTaskSummary> employeeBreakdown = employees.stream().map(emp -> {
            List<Task> userTasks = tasksByAssignee.getOrDefault(emp.getId(), List.of());
            long total = userTasks.size();
            long completed = userTasks.stream().filter(t -> t.getStatus() == Task.TaskStatus.COMPLETED).count();
            long inProgress = userTasks.stream().filter(t -> t.getStatus() == Task.TaskStatus.IN_PROGRESS).count();
            long pending = userTasks.stream().filter(t -> t.getStatus() == Task.TaskStatus.PENDING).count();

            return TasksReportDto.EmployeeTaskSummary.builder()
                    .userId(emp.getId())
                    .employeeId(emp.getEmployeeId())
                    .fullName(emp.getFullName())
                    .totalAssigned(total)
                    .completed(completed)
                    .inProgress(inProgress)
                    .pending(pending)
                    .build();
        }).toList();

        return TasksReportDto.builder()
                .totalTasks(allTasks.size())
                .countByStatus(countByStatus)
                .countByPriority(countByPriority)
                .employeeBreakdown(employeeBreakdown)
                .build();
    }

    /**
     * Compiles research and development project health summaries, tracking associated tasks,
     * scientific experiments, development records, and attachments.
     *
     * @return an {@link RndReportDto} containing the portfolio overview
     */
    @Transactional(readOnly = true)
    public RndReportDto getRndReport() {
        List<RndProject> projects = projectRepository.findAll();

        List<RndReportDto.ProjectRndSummary> summaries = projects.stream().map(p -> {
            List<Task> tasks = taskRepository.findByProjectIdOrderByDeadlineAsc(p.getId());
            long completedTasks = tasks.stream().filter(t -> t.getStatus() == Task.TaskStatus.COMPLETED).count();
            long expCount = experimentRepository.countByProjectId(p.getId());
            long devCount = developmentRecordRepository.countByProjectId(p.getId());
            long fileCount = fileRepository.countByEntityTypeAndEntityId(UploadedFile.FileEntityType.project, p.getId());

            return RndReportDto.ProjectRndSummary.builder()
                    .projectId(p.getId())
                    .code(p.getCode())
                    .name(p.getName())
                    .status(p.getStatus().name())
                    .progressPct(p.getProgressPct())
                    .responsibleName(p.getResponsible() != null ? p.getResponsible().getFullName() : null)
                    .tasksCount(tasks.size())
                    .completedTasksCount(completedTasks)
                    .experimentsCount(expCount)
                    .developmentRecordsCount(devCount)
                    .filesCount(fileCount)
                    .build();
        }).toList();

        return RndReportDto.builder()
                .totalProjects(projects.size())
                .projects(summaries)
                .build();
    }

    /**
     * Compiles high-level executive KPI indicators across all core domains.
     *
     * @return a {@link ReportSummaryDto} with total counts of employees, active projects, tasks, experiments, and training
     */
    @Transactional(readOnly = true)
    public ReportSummaryDto getSummary() {
        long totalEmp = userRepository.countActiveEmployees();
        long activeProj = projectRepository.countByStatusIn(List.of(RndProject.ProjectStatus.PENDING, RndProject.ProjectStatus.IN_PROGRESS));
        long totalTasks = taskRepository.count();
        long completedTasks = taskRepository.countByStatus(Task.TaskStatus.COMPLETED);
        long totalExp = experimentRepository.count();
        long totalTrainings = trainingRepository.count();

        return ReportSummaryDto.builder()
                .totalEmployees(totalEmp)
                .activeProjects(activeProj)
                .totalTasks(totalTasks)
                .completedTasks(completedTasks)
                .totalExperiments(totalExp)
                .totalTrainings(totalTrainings)
                .build();
    }
}
