package com.saturn.rnd.controller;

import com.saturn.rnd.dto.ApiResponse;
import com.saturn.rnd.dto.ContactRequest;
import com.saturn.rnd.dto.ContactResponse;
import com.saturn.rnd.service.ContactService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST Controller for processing website visitor contact inquiries.
 *
 * <p>
 * <strong>Endpoint:</strong> {@code POST /api/v1/contact}
 * </p>
 * <p>
 * <strong>Payload Type:</strong> {@code application/json}
 * </p>
 * <p>
 * <strong>Access Control:</strong> Public
 * </p>
 *
 * <h2>Processing Workflow</h2>
 * <ol>
 * <li>Intercepts JSON payload from frontend contact form
 * ({@code ContactSection.tsx}).</li>
 * <li>Enforces Bean Validation constraints ({@code @Valid}) via Spring
 * Validation.</li>
 * <li>Delegates entity persistence and unique ID generation to
 * {@link ContactService}.</li>
 * <li>Wraps result in a standardized {@link ApiResponse} JSON envelope
 * returning HTTP 201 (Created).</li>
 * </ol>
 *
 * @author Saturn R&D Engineering
 * @version 0.1.0
 * @see ContactRequest
 * @see ContactResponse
 * @see ContactService
 */
@RestController
@RequestMapping("/api/v1/contact")
@RequiredArgsConstructor
public class ContactController {

        private final ContactService contactService;

        /**
         * Handles incoming contact form submission requests.
         *
         * @param request Validated JSON body containing name, email, subject, and
         *                message
         * @return {@link ResponseEntity} containing standardized {@link ApiResponse}
         *         envelope with generated inquiry ID
         */
        @PostMapping
        public ResponseEntity<ApiResponse<ContactResponse>> submitContactInquiry(
                        @Valid @RequestBody ContactRequest request) {
                log.info("Received POST /api/v1/contact from name='{}', email='{}', subject='{}'",
                                request.getName(), request.getEmail(), request.getSubject());

                ContactResponse responseData = contactService.processInquiry(request);

                log.debug("Successfully processed contact inquiry, generated ID: {}", responseData.getInquiryId());

                ApiResponse<ContactResponse> envelope = ApiResponse.success(
                                HttpStatus.CREATED.value(),
                                "Thank you for reaching out. The Saturn R&D team has received your message.",
                                responseData);

                return ResponseEntity.status(HttpStatus.CREATED).body(envelope);
        }
}
