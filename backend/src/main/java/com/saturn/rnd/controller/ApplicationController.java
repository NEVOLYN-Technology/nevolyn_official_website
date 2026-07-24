package com.saturn.rnd.controller;

import com.saturn.rnd.dto.ApiResponse;
import com.saturn.rnd.dto.ApplicationResponse;
import com.saturn.rnd.service.ApplicationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

/**
 * REST Controller for candidate job applications and resume document uploads.
 *
 * <p><strong>Endpoint:</strong> {@code POST /api/v1/applications}</p>
 * <p><strong>Payload Type:</strong> {@code multipart/form-data}</p>
 * <p><strong>Access Control:</strong> Public</p>
 *
 * <h2>Processing Workflow</h2>
 * <ol>
 *   <li>Receives multipart parameters submitted from {@code frontend/app/join_us/page.tsx}.</li>
 *   <li>Passes applicant text metadata and binary CV file to {@link ApplicationService}.</li>
 *   <li>Verifies file MIME type (.pdf, .doc, .docx) and stores binary file in local upload path.</li>
 *   <li>Persists applicant entity in database with reference path to saved resume file.</li>
 *   <li>Returns HTTP 201 Created wrapped inside standard {@link ApiResponse} JSON envelope.</li>
 * </ol>
 *
 * @author Saturn R&D Engineering
 * @version 0.1.0
 * @see ApplicationService
 * @see ApplicationResponse
 */
@RestController
@RequestMapping("/api/v1/applications")
@RequiredArgsConstructor
public class ApplicationController {

    private final ApplicationService applicationService;

    /**
     * Handles candidate job application submissions with CV document attachment.
     *
     * @param name Full display name of the applicant
     * @param email Primary contact email address
     * @param phone Phone number (e.g. +88017XXXXXXXX)
     * @param address Residential address
     * @param reason Statement of motivation for joining Saturn R&D
     * @param linkedin Optional LinkedIn profile URL
     * @param github Optional GitHub profile URL
     * @param website Optional personal website or portfolio URL
     * @param resume Uploaded resume binary file (max 10MB)
     * @return {@link ResponseEntity} containing standardized {@link ApiResponse} with application ID and saved file details
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<ApplicationResponse>> submitApplication(
            @RequestParam("name") String name,
            @RequestParam("email") String email,
            @RequestParam("phone") String phone,
            @RequestParam("address") String address,
            @RequestParam("reason") String reason,
            @RequestParam(value = "linkedin", required = false) String linkedin,
            @RequestParam(value = "github", required = false) String github,
            @RequestParam(value = "website", required = false) String website,
            @RequestParam("resume") MultipartFile resume
    ) {
        ApplicationResponse responseData = applicationService.processApplication(
                name, email, phone, address, reason, linkedin, github, website, resume
        );

        ApiResponse<ApplicationResponse> envelope = ApiResponse.success(
                HttpStatus.CREATED.value(),
                "Application submitted successfully. Our HR & Engineering leads will review your CV.",
                responseData
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(envelope);
    }
}
