package com.saturn.rnd.service;

import com.saturn.rnd.exception.FileStorageException;
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
@Service
public class FileStorageService {

    private final Path fileStorageLocation;

    public FileStorageService(@Value("${app.storage.upload-dir:./uploads/resumes}") String uploadDir) {
        this.fileStorageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (Exception ex) {
            throw new FileStorageException("Could not create the upload directory for resumes.", ex);
        }
    }

    /**
     * Stores an uploaded resume file with sanitization and MIME type verification.
     *
     * @param file Uploaded multipart file
     * @param targetFileName Desired stored file name
     * @return Absolute target path string
     */
    public String storeFile(MultipartFile file, String targetFileName) {
        String originalFileName = StringUtils.cleanPath(Objects.requireNonNull(file.getOriginalFilename()));

        if (originalFileName.contains("..")) {
            throw new FileStorageException("Filename contains invalid path sequence: " + originalFileName);
        }

        String extension = "";
        int i = originalFileName.lastIndexOf('.');
        if (i >= 0) {
            extension = originalFileName.substring(i);
        }

        // Validate extension
        String lowerExt = extension.toLowerCase();
        if (!lowerExt.equals(".pdf") && !lowerExt.equals(".doc") && !lowerExt.equals(".docx")) {
            throw new FileStorageException("Only PDF, DOC, and DOCX files are permitted for resume uploads.");
        }

        try {
            Path targetLocation = this.fileStorageLocation.resolve(targetFileName + lowerExt);
            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, targetLocation, StandardCopyOption.REPLACE_EXISTING);
            }
            return targetLocation.toString();
        } catch (IOException ex) {
            throw new FileStorageException("Could not store file " + originalFileName + ". Please try again!", ex);
        }
    }
}
