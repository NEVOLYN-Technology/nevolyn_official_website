package com.nevolyn.officemanagement.dashboard.dto;

import com.nevolyn.officemanagement.attendance.dto.AttendanceResponse;
import com.nevolyn.officemanagement.project.dto.ProjectDto;
import com.nevolyn.officemanagement.task.dto.TaskDto;
import com.nevolyn.officemanagement.worklog.dto.WorkLogDto;
import lombok.Builder;

import java.util.List;

/**
 * Composite data transfer record summarizing the personalized employee dashboard:
 * greeting, attendance status today, assigned tasks, active projects, and recent work logs.
 */
@Builder
public record EmployeeDashboardDto(
        String greeting,
        String fullName,
        String designation,
        String employeeId,
        AttendanceResponse todayAttendance,
        List<TaskDto> myTasks,
        List<ProjectDto> myProjects,
        List<WorkLogDto> myWorkLogs
) {}
