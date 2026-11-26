package com.nevolyn.officemanagement.file.dto;

import com.nevolyn.officemanagement.file.entity.UploadedFile;
import lombok.Builder;

import java.time.Instant;

/**
 * Data transfer record describing an uploaded attachment, document, or project asset.
 * Includes storage metadata, MIME type, file byte size, and uploader identity.
 */
@Builder
public record FileDto(
        Long id,
        String entityType,
        Long entityId,
        String originalFilename,
        String storedFilename,
        Long fileSize,
        String mimeType,
        Long uploadedById,
        String uploadedByName,
        Instant uploadedAt
) {
    public static FileDto fromEntity(UploadedFile f) {
        if (f == null) return null;
        return FileDto.builder()
                .id(f.getId())
                .entityType(f.getEntityType() != null ? f.getEntityType().name() : null)
                .entityId(f.getEntityId())
                .originalFilename(f.getOriginalFilename())
                .storedFilename(f.getStoredFilename())
                .fileSize(f.getFileSize())
                .mimeType(f.getMimeType())
                .uploadedById(f.getUploadedBy() != null ? f.getUploadedBy().getId() : null)
                .uploadedByName(f.getUploadedBy() != null ? f.getUploadedBy().getFullName() : null)
                .uploadedAt(f.getUploadedAt())
                .build();
    }
}
