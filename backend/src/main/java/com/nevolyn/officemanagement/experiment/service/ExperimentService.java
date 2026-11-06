package com.nevolyn.officemanagement.experiment.service;

import com.nevolyn.officemanagement.audit.service.AuditService;
import com.nevolyn.officemanagement.common.exception.ResourceNotFoundException;
import com.nevolyn.officemanagement.experiment.dto.CreateExperimentRequest;
import com.nevolyn.officemanagement.experiment.dto.ExperimentDto;
import com.nevolyn.officemanagement.experiment.entity.Experiment;
import com.nevolyn.officemanagement.experiment.repository.ExperimentRepository;
import com.nevolyn.officemanagement.project.entity.RndProject;
import com.nevolyn.officemanagement.project.repository.RndProjectRepository;
import com.nevolyn.officemanagement.user.entity.User;
import com.nevolyn.officemanagement.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

/**
 * Service managing scientific experiments, laboratory protocols, and research trials.
 *
 * <p>Handles structured documentation of hypotheses, test procedures, empirical observations,
 * and scientific conclusions linked to R&D project initiatives.</p>
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ExperimentService {

    private final ExperimentRepository experimentRepository;
    private final RndProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;

    /**
     * Retrieves all experiment trial records associated with a project ordered by date descending.
     *
     * @param projectId the primary key ID of the project
     * @return list of {@link ExperimentDto} objects
     */
    @Transactional(readOnly = true)
    public List<ExperimentDto> getExperimentsByProject(Long projectId) {
        return experimentRepository.findByProjectIdOrderByExperimentDateDesc(projectId).stream()
                .map(ExperimentDto::fromEntity)
                .toList();
    }

    /**
     * Records a new laboratory experiment or test protocol under a project.
     *
     * @param projectId the primary key ID of the target project
     * @param request the experiment payload containing hypothesis, procedures, and observations
     * @param currentUsername username of the active authenticated researcher
     * @param clientIp remote client IP for security audit recording
     * @return the saved {@link ExperimentDto}
     * @throws ResourceNotFoundException if the project or researcher user cannot be resolved
     */
    @Transactional
    public ExperimentDto createExperiment(Long projectId, CreateExperimentRequest request, String currentUsername, String clientIp) {
        RndProject project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("RndProject", "id", projectId));

        User researcher;
        if (request.researcherId() != null) {
            researcher = userRepository.findById(request.researcherId())
                    .orElseThrow(() -> new ResourceNotFoundException("User", "id", request.researcherId()));
        } else {
            researcher = userRepository.findByUsername(currentUsername)
                    .orElseThrow(() -> new ResourceNotFoundException("User", "username", currentUsername));
        }

        LocalDate expDate = request.experimentDate() != null ? request.experimentDate() : LocalDate.now();

        Experiment experiment = Experiment.builder()
                .project(project)
                .title(request.title().trim())
                .experimentDate(expDate)
                .researcher(researcher)
                .objective(request.objective())
                .procedure(request.procedure())
                .result(request.result())
                .observation(request.observation())
                .conclusion(request.conclusion())
                .remarks(request.remarks())
                .build();

        Experiment saved = experimentRepository.save(experiment);

        auditService.log(
                "CREATE_EXPERIMENT",
                currentUsername,
                researcher,
                clientIp,
                "experiments",
                saved.getId(),
                "Added experiment to project " + project.getCode() + ": " + saved.getTitle()
        );

        return ExperimentDto.fromEntity(saved);
    }
}
