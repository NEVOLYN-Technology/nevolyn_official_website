package com.nevolyn.officemanagement.worklog.service;

import com.nevolyn.officemanagement.audit.service.AuditService;
import com.nevolyn.officemanagement.common.exception.ResourceNotFoundException;
import com.nevolyn.officemanagement.user.entity.User;
import com.nevolyn.officemanagement.user.repository.UserRepository;
import com.nevolyn.officemanagement.worklog.dto.CreateWorkLogRequest;
import com.nevolyn.officemanagement.worklog.dto.WorkLogDto;
import com.nevolyn.officemanagement.worklog.entity.WorkLog;
import com.nevolyn.officemanagement.worklog.repository.WorkLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * Service managing daily work log submissions, journal activity records, and employee productivity reports.
 *
 * <p>Provides role-partitioned log retrieval and idempotent daily work log submission (upserting
 * record if an entry for the user and calendar date already exists).</p>
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class WorkLogService {

    private final WorkLogRepository workLogRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;

    /**
     * Retrieves work logs accessible to the requesting user based on administrative role.
     *
     * @param username username of the requesting user
     * @param isAdmin flag indicating if user possesses administrator role
     * @return list of {@link WorkLogDto} objects
     * @throws ResourceNotFoundException if user is not found
     */
    @Transactional(readOnly = true)
    public List<WorkLogDto> getWorkLogs(String username, boolean isAdmin) {
        if (isAdmin) {
            return workLogRepository.findAll().stream()
                    .sorted((a, b) -> b.getLogDate().compareTo(a.getLogDate()))
                    .map(WorkLogDto::fromEntity)
                    .toList();
        } else {
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));
            return workLogRepository.findByUserIdOrderByLogDateDescSubmittedAtDesc(user.getId()).stream()
                    .map(WorkLogDto::fromEntity)
                    .toList();
        }
    }

    /**
     * Records or updates a daily work log entry for an employee.
     *
     * @param request work log payload containing accomplishments, hours spent, and issues
     * @param username username of the submitting employee
     * @param clientIp remote client IP for audit trail
     * @return the saved {@link WorkLogDto}
     * @throws ResourceNotFoundException if user cannot be found
     */
    @Transactional
    public WorkLogDto createWorkLog(CreateWorkLogRequest request, String username, String clientIp) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        LocalDate date = request.logDate() != null ? request.logDate() : LocalDate.now();

        WorkLog workLog = workLogRepository.findByUserIdAndLogDate(user.getId(), date)
                .orElseGet(() -> WorkLog.builder()
                        .user(user)
                        .logDate(date)
                        .build());

        workLog.setWorkCompleted(request.workCompleted().trim());
        workLog.setTimeSpentHours(request.timeSpentHours() != null ? request.timeSpentHours() : BigDecimal.valueOf(8.0));
        workLog.setIssues(request.issues());
        workLog.setNextAction(request.nextAction());
        workLog.setRemarks(request.remarks());

        WorkLog saved = workLogRepository.save(workLog);

        auditService.log(
                "SUBMIT_WORK_LOG",
                username,
                user,
                clientIp,
                "work_logs",
                saved.getId(),
                "Submitted daily work log for " + date
        );

        return WorkLogDto.fromEntity(saved);
    }
}
