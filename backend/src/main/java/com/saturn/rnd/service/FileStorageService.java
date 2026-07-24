package com.saturn.rnd.service;

import com.saturn.rnd.exception.FileStorageException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.*;
import java.util.Objects;

/**
 * Service managing safe local file storage for job candidate uploaded resumes.
 */
@Slf4j
@Service
public class FileStorageService {

    private final Path fileStorageLocation;

    public FileStorageService(@Value("${app.storage.upload-dir:./uploads/resumes}") String uploadDir) {
        this.fileStorageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        log.info("Initializing FileStorageService with storage directory: {}", this.fileStorageLocation);
        try {
            Files.createDirectories(this.fileStorageLocation);
            log.debug("Verified upload directory existence: {}", this.fileStorageLocation);
        } catch (Exception ex) {
            log.error("Failed to create upload storage directory at {}", this.fileStorageLocation, ex);
            throw new FileStorageException("Could not create the upload directory for resumes.", ex);
        }
    }

    /**
     * Stores an uploaded resume file with sanitization and MIME type verification.
     *
     * @param file           Uploaded multipart file
     * @param targetFileName Desired stored file name
     * @return Absolute target path string
     */
    public String storeFile(MultipartFile file, String targetFileName) {
        String originalFileName = StringUtils.cleanPath(Objects.requireNonNull(file.getOriginalFilename()));
        log.debug("Beginning file store operation for original filename: '{}', target base: '{}'", originalFileName,
                targetFileName);

        if (originalFileName.contains("..")) {
            log.warn("Path traversal security attempt detected in filename: {}", originalFileName);
            throw new FileStorageException("Filename contains invalid path sequence: " + originalFileName);
        }

        String extension = "";
        int i = originalFileName.lastIndexOf('.');
        if (i >= 0) {
            extension = originalFileName.substring(i);
        }

        String lowerExt = extension.toLowerCase();
        log.debug("Extracted file extension: '{}'", lowerExt);

        if (!lowerExt.equals(".pdf") && !lowerExt.equals(".doc") && !lowerExt.equals(".docx")) {
            log.warn("Rejected file upload due to unpermitted extension: '{}'", lowerExt);
            throw new FileStorageException("Only PDF, DOC, and DOCX files are permitted for resume uploads.");
        }

        try {
            Path targetLocation = this.fileStorageLocation.resolve(targetFileName + lowerExt);
            log.debug("Copying binary bytes to destination file: {}", targetLocation);
            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, targetLocation, StandardCopyOption.REPLACE_EXISTING);
            }
            log.info("Successfully stored resume file on disk at: {}", targetLocation);
            return targetLocation.toString();
        } catch (IOException ex) {
            log.error("IO Exception occurred while saving file '{}' to disk", originalFileName, ex);
            throw new FileStorageException("Could not store file " + originalFileName + ". Please try again!", ex);
        }
    }
}
