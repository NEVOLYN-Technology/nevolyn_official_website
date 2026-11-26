package com.nevolyn.officemanagement.project.service;

import com.nevolyn.officemanagement.audit.entity.AuditLog;
import com.nevolyn.officemanagement.audit.service.AuditService;
import com.nevolyn.officemanagement.common.exception.BusinessRuleException;
import com.nevolyn.officemanagement.common.exception.ResourceNotFoundException;
import com.nevolyn.officemanagement.development.dto.DevelopmentRecordDto;
import com.nevolyn.officemanagement.development.repository.DevelopmentRecordRepository;
import com.nevolyn.officemanagement.experiment.dto.ExperimentDto;
import com.nevolyn.officemanagement.experiment.repository.ExperimentRepository;
import com.nevolyn.officemanagement.file.dto.FileDto;
import com.nevolyn.officemanagement.file.entity.UploadedFile;
import com.nevolyn.officemanagement.file.repository.UploadedFileRepository;
import com.nevolyn.officemanagement.project.dto.CreateProjectRequest;
import com.nevolyn.officemanagement.project.dto.ProjectDetailDto;
import com.nevolyn.officemanagement.project.dto.ProjectDto;
import com.nevolyn.officemanagement.project.dto.UpdateProjectStatusRequest;
import com.nevolyn.officemanagement.project.entity.RndProject;
import com.nevolyn.officemanagement.project.repository.RndProjectRepository;
import com.nevolyn.officemanagement.task.dto.TaskDto;
import com.nevolyn.officemanagement.task.repository.TaskRepository;
import com.nevolyn.officemanagement.user.entity.User;
import com.nevolyn.officemanagement.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Core business service managing R&D project lifecycles, project details, and milestone tracking.
 *
 * <p>Orchestrates project CRUD, unique project code assignments, hierarchical detail aggregation
 * (embedding tasks, experiments, dev logs, and files), and status/progress transitions.</p>
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ProjectService {

    private final RndProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final TaskRepository taskRepository;
    private final ExperimentRepository experimentRepository;
    private final DevelopmentRecordRepository developmentRecordRepository;
    private final UploadedFileRepository fileRepository;
    private final AuditService auditService;

    /**
     * Retrieves all projects in the system.
     *
     * @return list of {@link ProjectDto} representations
     */
    @Transactional(readOnly = true)
    public List<ProjectDto> getAllProjects() {
        return projectRepository.findAll().stream()
                .map(ProjectDto::fromEntity)
                .toList();
    }

    /**
     * Finds a single project by its primary key ID.
     *
     * @param id the primary key ID of the project
     * @return the {@link ProjectDto}
     * @throws ResourceNotFoundException if the project is not found
     */
    @Transactional(readOnly = true)
    public ProjectDto getProjectById(Long id) {
        RndProject project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("RndProject", "id", id));
        return ProjectDto.fromEntity(project);
    }

    /**
     * Compiles a comprehensive deep-dive project detail view including all child entities.
     *
     * <p>Aggregates child tasks, experiments, development records, and attached files
     * linked to the target project.</p>
     *
     * @param id the primary key ID of the project
     * @return fully populated {@link ProjectDetailDto}
     * @throws ResourceNotFoundException if the project does not exist
     */
    @Transactional(readOnly = true)
    public ProjectDetailDto getProjectDetail(Long id) {
        RndProject project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("RndProject", "id", id));

        List<TaskDto> tasks = taskRepository.findByProjectIdOrderByDeadlineAsc(id).stream()
                .map(TaskDto::fromEntity).toList();

        List<ExperimentDto> experiments = experimentRepository.findByProjectIdOrderByExperimentDateDesc(id).stream()
                .map(ExperimentDto::fromEntity).toList();

        List<DevelopmentRecordDto> devRecords = developmentRecordRepository.findByProjectIdOrderByRecordDateDesc(id).stream()
                .map(DevelopmentRecordDto::fromEntity).toList();

        List<FileDto> files = fileRepository.findByEntityTypeAndEntityId(UploadedFile.FileEntityType.project, id).stream()
                .map(FileDto::fromEntity).toList();

        return ProjectDetailDto.builder()
                .project(ProjectDto.fromEntity(project))
                .tasks(tasks)
                .experiments(experiments)
                .developmentRecords(devRecords)
                .files(files)
                .build();
    }

    /**
     * Provisions a new R&D project and records creation audit event.
     *
     * @param request project creation payload containing code, title, dates, and assigned lead
     * @param adminUsername username of the administrative creator
     * @param clientIp remote client IP for audit tracking
     * @return the created {@link ProjectDto}
     * @throws BusinessRuleException if the project code already exists
     * @throws ResourceNotFoundException if creator or responsible user does not exist
     */
    @Transactional
    public ProjectDto createProject(CreateProjectRequest request, String adminUsername, String clientIp) {
        String formattedCode = request.code().trim().toUpperCase();
        if (projectRepository.existsByCode(formattedCode)) {
            throw new BusinessRuleException("Project code '" + formattedCode + "' is already in use.");
        }

        User creator = userRepository.findByUsername(adminUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", adminUsername));

        User responsible = null;
        if (request.responsibleId() != null) {
            responsible = userRepository.findById(request.responsibleId())
                    .orElseThrow(() -> new ResourceNotFoundException("User", "id", request.responsibleId()));
        }

        RndProject.ProjectStatus status = RndProject.ProjectStatus.PENDING;
        if (request.status() != null && !request.status().isBlank()) {
            try {
                status = RndProject.ProjectStatus.valueOf(request.status().toUpperCase().replace(" ", "_"));
            } catch (IllegalArgumentException ignored) {}
        }

        RndProject project = RndProject.builder()
                .code(formattedCode)
                .name(request.name().trim())
                .objective(request.objective())
                .description(request.description())
                .responsible(responsible)
                .startDate(request.startDate())
                .targetDate(request.targetDate())
                .status(status)
                .remarks(request.remarks())
                .createdBy(creator)
                .build();

        RndProject saved = projectRepository.save(project);

        auditService.log(
                AuditLog.ACTION_CREATE_PROJECT,
                adminUsername,
                creator,
                clientIp,
                "rnd_projects",
                saved.getId(),
                "Created project: " + saved.getCode() + " - " + saved.getName()
        );

        return ProjectDto.fromEntity(saved);
    }

    /**
     * Updates project lifecycle status, completion percentage, and executive notes.
     *
     * @param id primary key ID of the project to update
     * @param request status update payload (status, progress percentage, remarks)
     * @param adminUsername username of administrator applying the changes
     * @param clientIp remote client IP for audit tracking
     * @return the updated {@link ProjectDto}
     * @throws ResourceNotFoundException if the project does not exist
     * @throws BusinessRuleException if the status string is invalid
     */
    @Transactional
    public ProjectDto updateProjectStatus(Long id, UpdateProjectStatusRequest request, String adminUsername, String clientIp) {
        RndProject project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("RndProject", "id", id));

        try {
            project.setStatus(RndProject.ProjectStatus.valueOf(request.status().toUpperCase().replace(" ", "_")));
        } catch (IllegalArgumentException e) {
            throw new BusinessRuleException("Invalid status: " + request.status());
        }

        if (request.progressPct() != null) {
            project.setProgressPct(request.progressPct());
        }
        if (request.remarks() != null) {
            project.setRemarks(request.remarks());
        }

        RndProject saved = projectRepository.save(project);

        auditService.log(
                AuditLog.ACTION_EDIT_PROJECT,
                adminUsername,
                null,
                clientIp,
                "rnd_projects",
                saved.getId(),
                "Updated status of project " + saved.getCode() + " to " + saved.getStatus()
        );

        return ProjectDto.fromEntity(saved);
    }
}
