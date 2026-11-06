package com.nevolyn.officemanagement.audit.dto;

import com.nevolyn.officemanagement.audit.entity.AuditLog;
import lombok.Builder;

import java.time.Instant;

/**
 * Data transfer record presenting immutable security audit log entries.
 * Captures user identity, mutating action code, entity metadata, IP origin, and ISO timestamp.
 */
@Builder
public record AuditLogDto(
        Long id,
        String username,
        String action,
        String details,
        String ipAddress,
        String targetEntity,
        Long targetId,
        Instant createdAt
) {
    public static AuditLogDto fromEntity(AuditLog log) {
        if (log == null) return null;
        return AuditLogDto.builder()
                .id(log.getId())
                .username(log.getUsername())
                .action(log.getAction())
                .details(log.getDetails())
                .ipAddress(log.getIpAddress())
                .targetEntity(log.getTargetEntity())
                .targetId(log.getTargetId())
                .createdAt(log.getCreatedAt())
                .build();
    }
}
