package com.nevolyn.officemanagement.file.controller;

import com.nevolyn.officemanagement.common.util.IpUtils;
import com.nevolyn.officemanagement.file.dto.FileDto;
import com.nevolyn.officemanagement.file.service.FileService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;


/**
 * Secure document attachment and file storage controller.
 *
 * <p>Enables uploading files bound polymorphically to specific domain entities
 * (projects, experiments, tasks, work logs) and streaming authorized downloads.
 */
@RestController
@RequestMapping("/api/v1/files")
@RequiredArgsConstructor
public class FileController {

    private final FileService fileService;

    /**
     * Upload and bind a document attachment to a parent domain entity.
     *
     * @param entityType     Type of parent entity (e.g. 'project', 'experiment', 'task', 'work_log').
     * @param entityId       Primary key of the parent entity.
     * @param file           Multipart binary file content.
     * @param servletRequest HTTP request used to capture client IP.
     * @param userDetails    Authenticated user principal performing the upload.
     * @return Uploaded file metadata DTO with HTTP 201 Created status.
     */
    @PostMapping(value = "/upload/{entityType}/{entityId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<FileDto> uploadFile(
            @PathVariable String entityType,
            @PathVariable Long entityId,
            @RequestParam("file") MultipartFile file,
            HttpServletRequest servletRequest,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        String clientIp = IpUtils.extractClientIp(servletRequest);
        FileDto uploaded = fileService.uploadFile(file, entityType, entityId, userDetails.getUsername(), clientIp);
        return ResponseEntity.status(HttpStatus.CREATED).body(uploaded);
    }

    /**
     * Download and stream a stored document attachment by file ID.
     *
     * @param id             Attachment primary key in the uploaded_files table.
     * @param servletRequest HTTP request used to resolve client IP.
     * @param userDetails    Authenticated user principal requesting the file.
     * @return Binary resource payload with Content-Disposition attachment header.
     */
    @GetMapping("/{id}/download")
    public ResponseEntity<Resource> downloadFile(
            @PathVariable Long id,
            HttpServletRequest servletRequest,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        String clientIp = IpUtils.extractClientIp(servletRequest);
        FileService.DownloadResult result = fileService.downloadFile(id, userDetails.getUsername(), clientIp);

        MediaType mediaType = MediaType.APPLICATION_OCTET_STREAM;
        if (result.mimeType() != null) {
            try {
                mediaType = MediaType.parseMediaType(result.mimeType());
            } catch (Exception ignored) {}
        }

        return ResponseEntity.ok()
                .contentType(mediaType)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + result.filename() + "\"")
                .body(result.resource());
    }
}
