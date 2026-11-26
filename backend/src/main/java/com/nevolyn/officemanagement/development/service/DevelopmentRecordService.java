package com.nevolyn.officemanagement.development.service;

import com.nevolyn.officemanagement.audit.service.AuditService;
import com.nevolyn.officemanagement.common.exception.ResourceNotFoundException;
import com.nevolyn.officemanagement.development.dto.CreateDevelopmentRecordRequest;
import com.nevolyn.officemanagement.development.dto.DevelopmentRecordDto;
import com.nevolyn.officemanagement.development.entity.DevelopmentRecord;
import com.nevolyn.officemanagement.development.repository.DevelopmentRecordRepository;
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
 * Service managing technical development records, iteration milestones, and engineering logs.
 *
 * <p>Tracks product stage progressions, version increments, issues encountered,
 * and next operational actions within research and development projects.</p>
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class DevelopmentRecordService {

    private final DevelopmentRecordRepository developmentRecordRepository;
    private final RndProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;

    /**
     * Retrieves all development logs for a project in reverse chronological order.
     *
     * @param projectId the primary key ID of the project
     * @return list of {@link DevelopmentRecordDto} objects
     */
    @Transactional(readOnly = true)
    public List<DevelopmentRecordDto> getRecordsByProject(Long projectId) {
        return developmentRecordRepository.findByProjectIdOrderByRecordDateDesc(projectId).stream()
                .map(DevelopmentRecordDto::fromEntity)
                .toList();
    }

    /**
     * Records a new development cycle entry, linking it to a project and responsible engineer.
     *
     * @param projectId the ID of the parent project
     * @param request the development record payload containing product name, stage, and outcomes
     * @param currentUsername the username of the authenticated creator
     * @param clientIp remote IP address for audit compliance
     * @return the saved {@link DevelopmentRecordDto}
     * @throws ResourceNotFoundException if the project or designated responsible user cannot be found
     */
    @Transactional
    public DevelopmentRecordDto createRecord(Long projectId, CreateDevelopmentRecordRequest request, String currentUsername, String clientIp) {
        RndProject project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("RndProject", "id", projectId));

        User responsible;
        if (request.responsibleId() != null) {
            responsible = userRepository.findById(request.responsibleId())
                    .orElseThrow(() -> new ResourceNotFoundException("User", "id", request.responsibleId()));
        } else {
            responsible = userRepository.findByUsername(currentUsername)
                    .orElseThrow(() -> new ResourceNotFoundException("User", "username", currentUsername));
        }

        LocalDate recDate = request.recordDate() != null ? request.recordDate() : LocalDate.now();

        DevelopmentRecord record = DevelopmentRecord.builder()
                .project(project)
                .productName(request.productName().trim())
                .stage(request.stage().trim())
                .version(request.version())
                .recordDate(recDate)
                .responsible(responsible)
                .result(request.result())
                .issues(request.issues())
                .nextAction(request.nextAction())
                .build();

        DevelopmentRecord saved = developmentRecordRepository.save(record);

        auditService.log(
                "CREATE_DEV_RECORD",
                currentUsername,
                responsible,
                clientIp,
                "development_records",
                saved.getId(),
                "Added dev record to project " + project.getCode() + ": " + saved.getProductName()
        );

        return DevelopmentRecordDto.fromEntity(saved);
    }
}
