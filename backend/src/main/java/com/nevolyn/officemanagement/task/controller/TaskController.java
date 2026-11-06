package com.nevolyn.officemanagement.task.controller;

import com.nevolyn.officemanagement.common.util.IpUtils;
import com.nevolyn.officemanagement.task.dto.CreateTaskRequest;
import com.nevolyn.officemanagement.task.dto.TaskDto;
import com.nevolyn.officemanagement.task.dto.UpdateTaskRequest;
import com.nevolyn.officemanagement.task.service.TaskService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;


/**
 * Task management and workflow assignment controller.
 *
 * <p>Enforces role-based data partitioning:
 * <ul>
 *   <li>Administrators: Create tasks, assign staff, adjust priority, and monitor all organization tasks</li>
 *   <li>Employees: View tasks specifically assigned to them and transition execution states</li>
 * </ul>
 */
@RestController
@RequestMapping("/api/v1/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    /**
     * Retrieve tasks visible to the authenticated user.
     *
     * <p>Returns all tasks across the company for administrators, or strictly assigned tasks for employees.
     *
     * @param userDetails Authenticated user principal.
     * @return List of task DTOs scoped to user authority.
     */
    @GetMapping
    public ResponseEntity<List<TaskDto>> getTasks(@AuthenticationPrincipal UserDetails userDetails) {
        boolean isAdmin = userDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_admin") || a.getAuthority().equals("ROLE_ADMIN"));
        return ResponseEntity.ok(taskService.getTasksForUser(userDetails.getUsername(), isAdmin));
    }

    /**
     * Retrieve a single task by ID, verifying assignment access permissions.
     *
     * @param id          Task database primary key.
     * @param userDetails Authenticated user principal.
     * @return Task DTO representation.
     */
    @GetMapping("/{id}")
    public ResponseEntity<TaskDto> getTaskById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        boolean isAdmin = userDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_admin") || a.getAuthority().equals("ROLE_ADMIN"));
        return ResponseEntity.ok(taskService.getTaskById(id, userDetails.getUsername(), isAdmin));
    }

    /**
     * Create and delegate a new task to an employee.
     *
     * @param request        Validated creation payload with title, priority, due date, and assignee ID.
     * @param servletRequest HTTP request used to resolve client IP for audit recording.
     * @param admin          Authenticated administrator user principal.
     * @return Created task DTO with HTTP 201 Created status.
     */
    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_admin') or hasRole('ADMIN')")
    public ResponseEntity<TaskDto> createTask(
            @Valid @RequestBody CreateTaskRequest request,
            HttpServletRequest servletRequest,
            @AuthenticationPrincipal UserDetails admin
    ) {
        String clientIp = IpUtils.extractClientIp(servletRequest);
        TaskDto created = taskService.createTask(request, admin.getUsername(), clientIp);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * Update task status or assignment details.
     *
     * <p>Employees can update the execution state (e.g., to {@code IN_PROGRESS} or {@code COMPLETED});
     * administrators can reassign users, change deadlines, and modify priority.
     *
     * @param id             Task database primary key.
     * @param request        Validated update payload.
     * @param servletRequest HTTP request used to capture client IP.
     * @param userDetails    Authenticated user principal.
     * @return Updated task DTO.
     */
    @PatchMapping("/{id}")
    public ResponseEntity<TaskDto> updateTask(
            @PathVariable Long id,
            @Valid @RequestBody UpdateTaskRequest request,
            HttpServletRequest servletRequest,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        String clientIp = IpUtils.extractClientIp(servletRequest);
        boolean isAdmin = userDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_admin") || a.getAuthority().equals("ROLE_ADMIN"));
        return ResponseEntity.ok(taskService.updateTask(id, request, userDetails.getUsername(), isAdmin, clientIp));
    }
}
