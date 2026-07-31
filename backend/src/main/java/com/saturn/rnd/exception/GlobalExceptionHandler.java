package com.saturn.rnd.exception;

import com.saturn.rnd.dto.ApiResponse;
import com.saturn.rnd.dto.FieldErrorDto;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import java.util.List;
import java.util.UUID;

/**
 * Translates every exception escaping a controller into the standard
 * {@link ApiResponse} error envelope.
 *
 * <h2>What callers are told</h2>
 * Handlers for <em>expected</em> failures (validation, rejected upload, unknown
 * token) return the real message, because it is written for the end user and
 * tells them how to fix their request.
 *
 * <p>
 * The catch-all handler deliberately does <strong>not</strong>. An unexpected
 * exception's message routinely contains SQL fragments, absolute filesystem
 * paths, class names or connection strings, and this API is public and
 * unauthenticated — returning that text hands an attacker a free map of the
 * system. Instead the client receives a fixed message plus a random error ID,
 * and the full stack trace is logged against that same ID. Support can still
 * trace any report; nobody has to leak internals to do it.
 *
 * @author Saturn R&D Engineering
 * @version 0.2.0
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Bean Validation failure on an {@code @Valid} request body — returns 400
     * with the offending fields so the frontend can highlight them inline.
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        List<FieldErrorDto> errors = ex.getBindingResult().getFieldErrors().stream()
                .map(error -> new FieldErrorDto(error.getField(), error.getDefaultMessage()))
                .toList();

        log.warn("Validation failed for request. Field errors: {}", errors);

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.error(
                HttpStatus.BAD_REQUEST.value(),
                "Validation failed for request payload.",
                errors));
    }

    /**
     * Rejected upload — wrong type, or a name that failed path sanitization.
     * The message is safe to surface: it is authored in
     * {@code FileStorageService} for the applicant to read.
     */
    @ExceptionHandler(FileStorageException.class)
    public ResponseEntity<ApiResponse<Void>> handleFileStorageException(FileStorageException ex) {
        log.warn("FileStorageException caught: {}", ex.getMessage());

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.error(
                HttpStatus.BAD_REQUEST.value(),
                ex.getMessage(),
                null));
    }

    /**
     * Upload larger than {@code spring.servlet.multipart.max-file-size}.
     *
     * <p>
     * Without this handler the container's own error surfaces as an opaque 500,
     * even though it is entirely the client's to fix.
     */
    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ApiResponse<Void>> handleMaxUploadSizeExceeded(MaxUploadSizeExceededException ex) {
        log.warn("Rejected upload exceeding the configured maximum size: {}", ex.getMessage());

        return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE).body(ApiResponse.error(
                HttpStatus.PAYLOAD_TOO_LARGE.value(),
                "The uploaded file is too large. Maximum allowed size is 10MB.",
                null));
    }

    /**
     * Unknown, already-consumed or expired verification token — returns 404.
     */
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleResourceNotFoundException(ResourceNotFoundException ex) {
        log.warn("ResourceNotFoundException caught: {}", ex.getMessage());

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error(
                HttpStatus.NOT_FOUND.value(),
                ex.getMessage(),
                null));
    }

    /**
     * Unmapped endpoint or static resource requested by a client/bot — returns 404 quietly.
     */
    @ExceptionHandler(org.springframework.web.servlet.resource.NoResourceFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleNoResourceFoundException(org.springframework.web.servlet.resource.NoResourceFoundException ex) {
        log.debug("Unmapped path requested: /{}", ex.getResourcePath());

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error(
                HttpStatus.NOT_FOUND.value(),
                "Resource not found: /" + ex.getResourcePath(),
                null));
    }

    /**
     * Catch-all for genuinely unexpected failures.
     *
     * <p>
     * Logs the full stack trace against a generated error ID and returns only
     * that ID to the caller — see the class Javadoc for why the underlying
     * message is withheld.
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleGeneralException(Exception ex) {
        String errorId = UUID.randomUUID().toString().substring(0, 8);

        log.error("Unhandled exception in REST API layer [errorId={}]", errorId, ex);

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponse.error(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "An unexpected internal error occurred. Please try again later. "
                        + "If the problem persists, quote reference " + errorId + ".",
                null));
    }
}
