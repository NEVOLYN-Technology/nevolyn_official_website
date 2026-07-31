package com.saturn.rnd.service;

import com.saturn.rnd.exception.FileStorageException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Locale;
import java.util.Objects;
import java.util.Set;

/**
 * Stores candidate resume uploads on the local filesystem.
 *
 * <h2>Threat model</h2>
 * Both inputs to {@link #storeFile} are attacker-controlled: the uploaded
 * filename comes straight from the browser, and the caller-supplied base name is
 * derived from the applicant's own <em>name</em> field. Neither may be allowed to
 * influence <em>where</em> the file lands, so this class:
 * <ul>
 * <li>allow-lists the extension ({@code .pdf}, {@code .doc}, {@code .docx});</li>
 * <li>reduces the caller's base name to {@code [A-Za-z0-9._-]} only, which
 * removes path separators, {@code ..} sequences, NUL bytes and drive letters;</li>
 * <li>re-checks the fully resolved path against the storage root, so anything
 * that still escapes is rejected instead of written.</li>
 * </ul>
 *
 * <h2>Durability</h2>
 * Files land on the container filesystem, which is ephemeral on Render's free
 * tier — uploads do not survive a redeploy or cold start. The admin notification
 * email carries the CV as an attachment, and is currently the only durable copy.
 * Attach a Render Disk or move to object storage before relying on this.
 *
 * @author Saturn R&D Engineering
 * @version 0.2.0
 */
@Slf4j
@Service
public class FileStorageService {

    /** Upload formats accepted for a CV. Anything else is rejected outright. */
    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(".pdf", ".doc", ".docx");

    /** Every character outside this class is replaced before use in a path. */
    private static final String UNSAFE_CHARACTERS = "[^A-Za-z0-9._-]";

    /** Guards against a pathological name producing an unusable filename. */
    private static final int MAX_BASE_NAME_LENGTH = 120;

    /** Absolute, normalised root directory that all uploads must stay inside. */
    private final Path fileStorageLocation;

    /**
     * @param uploadDir configured storage root ({@code app.storage.upload-dir});
     *                  created at startup if it does not already exist
     * @throws FileStorageException if the directory cannot be created, which is
     *                              fatal — failing at boot is far better than
     *                              failing on a candidate's submission
     */
    public FileStorageService(@Value("${app.storage.upload-dir:./uploads/resumes}") String uploadDir) {
        this.fileStorageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        log.info("Initializing FileStorageService with storage directory: {}", this.fileStorageLocation);
        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (Exception ex) {
            log.error("Failed to create upload storage directory at {}", this.fileStorageLocation, ex);
            throw new FileStorageException("Could not create the upload directory for resumes.", ex);
        }
    }

    /**
     * Validates and stores an uploaded resume.
     *
     * @param file           the uploaded document
     * @param targetFileName desired base name, without extension; sanitized here
     *                       and never trusted, because it is derived from
     *                       user-supplied form input
     * @return absolute path of the stored file
     * @throws FileStorageException if the type is not allowed, the resolved path
     *                              escapes the storage root, or the write fails
     */
    public String storeFile(MultipartFile file, String targetFileName) {
        String originalFileName = StringUtils.cleanPath(Objects.requireNonNull(file.getOriginalFilename()));
        String extension = extractAllowedExtension(originalFileName);
        String safeBaseName = sanitizeBaseName(targetFileName);

        // Resolve first, then verify containment. Checking the raw string is not
        // enough: only the normalised absolute path reveals where it truly lands.
        Path targetLocation = this.fileStorageLocation.resolve(safeBaseName + extension).normalize();

        if (!targetLocation.startsWith(this.fileStorageLocation)) {
            log.warn("Blocked path traversal attempt. Base name '{}' resolved outside the storage root.",
                    targetFileName);
            throw new FileStorageException("Invalid file name supplied.");
        }

        try (InputStream inputStream = file.getInputStream()) {
            Files.copy(inputStream, targetLocation, StandardCopyOption.REPLACE_EXISTING);
            log.info("Stored resume file at: {}", targetLocation);
            return targetLocation.toString();
        } catch (IOException ex) {
            log.error("IO error while saving uploaded file '{}'", originalFileName, ex);
            throw new FileStorageException("Could not store file " + originalFileName + ". Please try again.", ex);
        }
    }

    /**
     * Returns the lower-cased extension of {@code originalFileName}, rejecting
     * anything outside {@link #ALLOWED_EXTENSIONS}.
     *
     * <p>
     * This is an allow-list on purpose. A deny-list of dangerous extensions is
     * always incomplete, and double extensions such as {@code cv.pdf.exe} defeat
     * naive checks — only the final extension is considered here, and it must be
     * one of the three permitted values.
     */
    private String extractAllowedExtension(String originalFileName) {
        int dotIndex = originalFileName.lastIndexOf('.');
        String extension = dotIndex >= 0
                ? originalFileName.substring(dotIndex).toLowerCase(Locale.ROOT)
                : "";

        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            log.warn("Rejected upload with disallowed extension: '{}'", extension);
            throw new FileStorageException("Only PDF, DOC, and DOCX files are permitted for resume uploads.");
        }
        return extension;
    }

    /**
     * Strips everything that could alter the storage location from a base name.
     *
     * <p>
     * The caller builds this from the applicant's name, so it can contain
     * anything at all. Replacing the whole complement of {@code [A-Za-z0-9._-]}
     * removes {@code /}, {@code \}, {@code :} and NUL in one pass; the leading
     * dots are then collapsed so a name of {@code ..} cannot survive as a
     * parent-directory reference.
     */
    private String sanitizeBaseName(String rawBaseName) {
        String sanitized = (rawBaseName == null ? "" : rawBaseName).replaceAll(UNSAFE_CHARACTERS, "_");

        // A name consisting only of dots would otherwise become "." or "..".
        sanitized = sanitized.replaceAll("^\\.+", "");

        if (sanitized.length() > MAX_BASE_NAME_LENGTH) {
            sanitized = sanitized.substring(0, MAX_BASE_NAME_LENGTH);
        }
        if (sanitized.isBlank()) {
            sanitized = "resume";
        }
        return sanitized;
    }
}
