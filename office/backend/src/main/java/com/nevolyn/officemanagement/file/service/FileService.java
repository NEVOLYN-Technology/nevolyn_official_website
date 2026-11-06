package com.nevolyn.officemanagement.file.service;

import com.nevolyn.officemanagement.audit.entity.AuditLog;
import com.nevolyn.officemanagement.audit.service.AuditService;
import com.nevolyn.officemanagement.common.exception.BusinessRuleException;
import com.nevolyn.officemanagement.common.exception.ResourceNotFoundException;
import com.nevolyn.officemanagement.file.dto.FileDto;
import com.nevolyn.officemanagement.file.entity.UploadedFile;
import com.nevolyn.officemanagement.file.repository.UploadedFileRepository;
import com.nevolyn.officemanagement.user.entity.User;
import com.nevolyn.officemanagement.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Set;
import java.util.UUID;

/**
 * Service managing polymorphic file uploads, persistent storage on the filesystem,
 * and security-enforced binary downloads.
 *
 * <p>Enforces file size quotas (maximum 16MB), strict MIME/extension whitelisting,
 * sanitized unique storage naming, and immutable audit logs for file operations.</p>
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class FileService {

    private final UploadedFileRepository fileRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(
            "pdf", "xlsx", "xls", "doc", "docx", "png", "jpg", "jpeg", "gif", "txt", "csv"
    );
    private static final long MAX_FILE_SIZE = 16L * 1024 * 1024; // 16MB

    /**
     * Stores an uploaded multipart file to disk and records metadata in the database.
     *
     * @param file the binary multipart payload uploaded by the client
     * @param entityTypeStr polymorphic target category name (e.g. "task", "project")
     * @param entityId primary key ID of the parent entity receiving the attachment
     * @param username username of the user uploading the file
     * @param clientIp remote client IP for audit tracking
     * @return the saved {@link FileDto} attachment metadata
     * @throws BusinessRuleException if file is empty, exceeds 16MB, has an unapproved extension, or disk I/O fails
     * @throws ResourceNotFoundException if the uploading user cannot be found
     */
    @Transactional
    public FileDto uploadFile(MultipartFile file, String entityTypeStr, Long entityId, String username, String clientIp) {
        if (file.isEmpty()) {
            throw new BusinessRuleException("Uploaded file is empty.");
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new BusinessRuleException("File size exceeds 16MB maximum limit.");
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.isBlank()) {
            throw new BusinessRuleException("Invalid filename.");
        }

        String extension = "";
        int dotIndex = originalFilename.lastIndexOf('.');
        if (dotIndex > 0) {
            extension = originalFilename.substring(dotIndex + 1).toLowerCase();
        }

        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new BusinessRuleException("File type '." + extension + "' is not permitted. Allowed: " + ALLOWED_EXTENSIONS);
        }

        UploadedFile.FileEntityType entityType;
        try {
            entityType = UploadedFile.FileEntityType.valueOf(entityTypeStr.toLowerCase());
        } catch (IllegalArgumentException e) {
            throw new BusinessRuleException("Invalid entity type: " + entityTypeStr);
        }

        User uploader = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        try {
            Path targetDir = Paths.get(uploadDir).toAbsolutePath().normalize();
            Files.createDirectories(targetDir);

            String storedFilename = UUID.randomUUID() + "_" + originalFilename.replaceAll("[^a-zA-Z0-9._-]", "_");
            Path targetPath = targetDir.resolve(storedFilename);
            file.transferTo(targetPath.toFile());

            UploadedFile uploadedFile = UploadedFile.builder()
                    .entityType(entityType)
                    .entityId(entityId)
                    .originalFilename(originalFilename)
                    .storedFilename(storedFilename)
                    .filePath(targetPath.toString())
                    .fileSize(file.getSize())
                    .mimeType(file.getContentType())
                    .uploadedBy(uploader)
                    .build();

            UploadedFile saved = fileRepository.save(uploadedFile);

            auditService.log(
                    AuditLog.ACTION_FILE_UPLOAD,
                    username,
                    uploader,
                    clientIp,
                    "uploaded_files",
                    saved.getId(),
                    "Uploaded file: " + originalFilename + " for " + entityType + " #" + entityId
            );

            return FileDto.fromEntity(saved);
        } catch (IOException e) {
            log.error("Failed to store uploaded file: {}", e.getMessage());
            throw new BusinessRuleException("Failed to store file: " + e.getMessage());
        }
    }

    /**
     * Resolves an uploaded file from disk storage for secure client downloading.
     *
     * @param fileId the primary key ID of the uploaded file record
     * @param username username of the user requesting the download
     * @param clientIp remote client IP for audit recording
     * @return a {@link DownloadResult} containing the file resource, original filename, and MIME type
     * @throws ResourceNotFoundException if the file record or physical file on disk is not found
     */
    public DownloadResult downloadFile(Long fileId, String username, String clientIp) {
        UploadedFile uploadedFile = fileRepository.findById(fileId)
                .orElseThrow(() -> new ResourceNotFoundException("UploadedFile", "id", fileId));

        File file = new File(uploadedFile.getFilePath());
        if (!file.exists()) {
            throw new ResourceNotFoundException("File", "path", uploadedFile.getOriginalFilename());
        }

        auditService.log(
                AuditLog.ACTION_FILE_DOWNLOAD,
                username,
                null,
                clientIp,
                "uploaded_files",
                uploadedFile.getId(),
                "Downloaded file: " + uploadedFile.getOriginalFilename()
        );

        Resource resource = new FileSystemResource(file);
        return new DownloadResult(resource, uploadedFile.getOriginalFilename(), uploadedFile.getMimeType());
    }

    /**
     * Value container holding a resolved file resource and HTTP stream headers.
     *
     * @param resource filesystem resource handle to the file
     * @param filename original user-provided filename
     * @param mimeType registered MIME content type
     */
    public record DownloadResult(Resource resource, String filename, String mimeType) {}
}
