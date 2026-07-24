package com.saturn.rnd.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Incoming request payload for website contact inquiries (`POST /api/v1/contact`).
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ContactRequest {

    @NotBlank(message = "Full name is required.")
    @Size(max = 100, message = "Name must not exceed 100 characters.")
    private String name;

    @NotBlank(message = "Email address is required.")
    @Email(message = "Must be a valid email address format.")
    private String email;

    @NotBlank(message = "Subject is required.")
    @Size(max = 200, message = "Subject must not exceed 200 characters.")
    private String subject;

    @NotBlank(message = "Message body is required.")
    @Size(max = 2000, message = "Message body must not exceed 2000 characters.")
    private String message;
}
