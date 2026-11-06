package com.nevolyn.officemanagement.worklog.dto;

import com.nevolyn.officemanagement.worklog.entity.WorkLog;
import lombok.Builder;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

/**
 * Data transfer object representing an employee's daily work log entry.
 *
 * <p>Transfers accomplishment logs, hours spent, encountered issues, and next actions
 * along with submitting user identifiers.</p>
 */
@Builder
public record WorkLogDto(
        Long id,
        Long userId,
        String employeeId,
        String fullName,
        LocalDate logDate,
        String workCompleted,
        BigDecimal timeSpentHours,
        String issues,
        String nextAction,
        String remarks,
        Instant submittedAt
) {
    public static WorkLogDto fromEntity(WorkLog log) {
        if (log == null) return null;
        return WorkLogDto.builder()
                .id(log.getId())
                .userId(log.getUser() != null ? log.getUser().getId() : null)
                .employeeId(log.getUser() != null ? log.getUser().getEmployeeId() : null)
                .fullName(log.getUser() != null ? log.getUser().getFullName() : null)
                .logDate(log.getLogDate())
                .workCompleted(log.getWorkCompleted())
                .timeSpentHours(log.getTimeSpentHours())
                .issues(log.getIssues())
                .nextAction(log.getNextAction())
                .remarks(log.getRemarks())
                .submittedAt(log.getSubmittedAt())
                .build();
    }
}
