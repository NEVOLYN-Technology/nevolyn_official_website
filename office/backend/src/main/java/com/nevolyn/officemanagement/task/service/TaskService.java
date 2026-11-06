package com.nevolyn.officemanagement.task.service;

import com.nevolyn.officemanagement.audit.entity.AuditLog;
import com.nevolyn.officemanagement.audit.service.AuditService;
import com.nevolyn.officemanagement.common.exception.BusinessRuleException;
import com.nevolyn.officemanagement.common.exception.ResourceNotFoundException;
import com.nevolyn.officemanagement.project.entity.RndProject;
import com.nevolyn.officemanagement.project.repository.RndProjectRepository;
import com.nevolyn.officemanagement.task.dto.CreateTaskRequest;
import com.nevolyn.officemanagement.task.dto.TaskDto;
import com.nevolyn.officemanagement.task.dto.UpdateTaskRequest;
import com.nevolyn.officemanagement.task.entity.Task;
import com.nevolyn.officemanagement.task.repository.TaskRepository;
import com.nevolyn.officemanagement.user.entity.User;
import com.nevolyn.officemanagement.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Core business service managing task lifecycles, project associations, and employee assignments.
 *
 * <p>Enforces role-based visibility rules (employees view their assigned tasks; administrators view
 * company-wide tasks), assignment eligibility constraints (only active employees), and status
 * progress updates.</p>
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final RndProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;

    /**
     * Retrieves tasks accessible to the requesting user based on their role privileges.
     *
     * @param username username of the requesting user
     * @param isAdmin flag indicating whether the user possesses administrator authority
     * @return list of {@link TaskDto} objects
     * @throws ResourceNotFoundException if the user cannot be found
     */
    @Transactional(readOnly = true)
    public List<TaskDto> getTasksForUser(String username, boolean isAdmin) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        if (isAdmin) {
            return taskRepository.findAll().stream().map(TaskDto::fromEntity).toList();
        } else {
            return taskRepository.findByAssignedToIdOrderByDeadlineAsc(user.getId()).stream()
                    .map(TaskDto::fromEntity).toList();
        }
    }

    /**
     * Retrieves a specific task after enforcing security ownership or administrative access.
     *
     * @param id the primary key ID of the task
     * @param username username of the requesting user
     * @param isAdmin flag indicating whether the user has administrator authority
     * @return the {@link TaskDto}
     * @throws ResourceNotFoundException if the task is not found
     * @throws AccessDeniedException if a non-admin attempts to view a task assigned to another user
     */
    @Transactional(readOnly = true)
    public TaskDto getTaskById(Long id, String username, boolean isAdmin) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task", "id", id));

        if (!isAdmin && !task.getAssignedTo().getUsername().equals(username)) {
            throw new AccessDeniedException("You are not authorized to view this task.");
        }

        return TaskDto.fromEntity(task);
    }

    /**
     * Provisions and assigns a new task to an active employee under an optional project.
     *
     * @param request task creation payload containing title, description, dates, priority, and assignee
     * @param adminUsername username of administrator creating the task
     * @param clientIp remote client IP for audit logging
     * @return the created {@link TaskDto}
     * @throws BusinessRuleException if assignee is not an active employee or target project is completed
     * @throws ResourceNotFoundException if administrator, assignee, or parent project does not exist
     */
    @Transactional
    public TaskDto createTask(CreateTaskRequest request, String adminUsername, String clientIp) {
        User admin = userRepository.findByUsername(adminUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", adminUsername));

        User assignee = userRepository.findById(request.assignedToId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", request.assignedToId()));

        if (!assignee.getRole().equals(User.UserRole.employee)) {
            throw new BusinessRuleException("Tasks can only be assigned to employees.");
        }
        if (!Boolean.TRUE.equals(assignee.getIsActive())) {
            throw new BusinessRuleException("Cannot assign tasks to deactivated employees.");
        }

        RndProject project = null;
        if (request.projectId() != null) {
            project = projectRepository.findById(request.projectId())
                    .orElseThrow(() -> new ResourceNotFoundException("RndProject", "id", request.projectId()));
            if (project.getStatus() == RndProject.ProjectStatus.COMPLETED) {
                throw new BusinessRuleException("Tasks cannot be created under a completed project.");
            }
        }

        Task.TaskPriority priority = Task.TaskPriority.MEDIUM;
        if (request.priority() != null && !request.priority().isBlank()) {
            try {
                priority = Task.TaskPriority.valueOf(request.priority().toUpperCase());
            } catch (IllegalArgumentException ignored) {}
        }

        Task task = Task.builder()
                .project(project)
                .title(request.title().trim())
                .description(request.description())
                .assignedTo(assignee)
                .startDate(request.startDate())
                .deadline(request.deadline())
                .priority(priority)
                .status(Task.TaskStatus.PENDING)
                .progressPct(0)
                .createdBy(admin)
                .build();

        Task saved = taskRepository.save(task);

        auditService.log(
                AuditLog.ACTION_CREATE_TASK,
                adminUsername,
                admin,
                clientIp,
                "tasks",
                saved.getId(),
                "Assigned task: '" + saved.getTitle() + "' to " + assignee.getUsername()
        );

        return TaskDto.fromEntity(saved);
    }

    /**
     * Updates an existing task's status, progress percentage, and operational remarks.
     *
     * @param id the primary key ID of the task
     * @param request status update payload
     * @param username username of the user making the update
     * @param isAdmin flag indicating whether the requester is an administrator
     * @param clientIp remote client IP for audit logging
     * @return the updated {@link TaskDto}
     * @throws ResourceNotFoundException if the task does not exist
     * @throws AccessDeniedException if an employee attempts to update a task assigned to someone else
     * @throws BusinessRuleException if the status string is invalid
     */
    @Transactional
    public TaskDto updateTask(Long id, UpdateTaskRequest request, String username, boolean isAdmin, String clientIp) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task", "id", id));

        if (!isAdmin && !task.getAssignedTo().getUsername().equals(username)) {
            throw new AccessDeniedException("You are only permitted to update your own assigned tasks.");
        }

        try {
            task.setStatus(Task.TaskStatus.valueOf(request.status().toUpperCase().replace(" ", "_")));
        } catch (IllegalArgumentException e) {
            throw new BusinessRuleException("Invalid status: " + request.status());
        }

        if (request.progressPct() != null) {
            task.setProgressPct(Math.min(100, Math.max(0, request.progressPct())));
        }
        if (request.remarks() != null) {
            task.setRemarks(request.remarks());
        }

        Task saved = taskRepository.save(task);

        auditService.log(
                AuditLog.ACTION_UPDATE_TASK,
                username,
                null,
                clientIp,
                "tasks",
                saved.getId(),
                "Updated task status to: " + saved.getStatus() + " (" + saved.getProgressPct() + "%)"
        );

        return TaskDto.fromEntity(saved);
    }
}
