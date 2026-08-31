package com.nevolyn.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

/**
 * Global standardized JSON response envelope for all REST API endpoints.
 *
 * @param <T> Type of response payload data
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {

    /** Status indicator: "success" or "error" */
    private String status;

    /** HTTP status code (e.g. 200, 201, 400, 500) */
    private int code;

    /** Human-readable status summary message */
    private String message;

    /** Response data payload */
    private T data;

    /** List of field-level validation errors (populated on error responses) */
    private List<FieldErrorDto> errors;

    /** ISO-8601 UTC timestamp of response generation */
    @Builder.Default
    private String timestamp = Instant.now().toString();

    public static <T> ApiResponse<T> success(int code, String message, T data) {
        return ApiResponse.<T>builder()
                .status("success")
                .code(code)
                .message(message)
                .data(data)
                .timestamp(Instant.now().toString())
                .build();
    }

    public static <T> ApiResponse<T> error(int code, String message, List<FieldErrorDto> errors) {
        return ApiResponse.<T>builder()
                .status("error")
                .code(code)
                .message(message)
                .errors(errors)
                .timestamp(Instant.now().toString())
                .build();
    }
}
