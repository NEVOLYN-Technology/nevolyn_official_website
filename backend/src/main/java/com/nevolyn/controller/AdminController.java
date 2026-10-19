package com.nevolyn.controller;

import com.nevolyn.dto.AdminApplicationResponse;
import com.nevolyn.dto.AdminInquiryResponse;
import com.nevolyn.dto.AdminStatusUpdateRequest;
import com.nevolyn.dto.PageResponse;
import com.nevolyn.exception.ResourceNotFoundException;
import com.nevolyn.model.ContactInquiry;
import com.nevolyn.model.JobApplication;
import com.nevolyn.repository.ContactInquiryRepository;
import com.nevolyn.repository.JobApplicationRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

/**
 * Administrative REST endpoints for the NEVOLYN Operations Dashboard.
 *
 * <p>All endpoints in this class are protected by Spring Security HTTP Basic
 * authentication — the ADMIN role is required. Public submission endpoints
 * remain on their respective controllers (ContactController, ApplicationController).
 *
 * <h2>Resources</h2>
 * <ul>
 *   <li>{@code GET /api/v1/admin/contact-inquiries} — paginated list with status/search filter</li>
 *   <li>{@code GET /api/v1/admin/contact-inquiries/{id}} — single inquiry detail</li>
 *   <li>{@code PATCH /api/v1/admin/contact-inquiries/{id}/status} — status mutation</li>
 *   <li>{@code DELETE /api/v1/admin/contact-inquiries/{id}} — permanent delete</li>
 *   <li>{@code GET /api/v1/admin/applications} — paginated list with status/search filter</li>
 *   <li>{@code GET /api/v1/admin/applications/{id}} — single application detail</li>
 *   <li>{@code PATCH /api/v1/admin/applications/{id}/status} — status mutation</li>
 *   <li>{@code DELETE /api/v1/admin/applications/{id}} — permanent delete</li>
 *   <li>{@code GET /api/v1/admin/stats} — KPI metrics summary</li>
 * </ul>
 *
 * <h2>Status values</h2>
 * <ul>
 *   <li>ContactInquiry: NEW | IN_REVIEW | CONTACTED | CLOSED</li>
 *   <li>JobApplication: PENDING | IN_REVIEW | SHORTLISTED | REJECTED | HIRED</li>
 * </ul>
 *
 * @author NEVOLYN Technology Engineering
 * @version 0.4.0
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class AdminController {

    private final ContactInquiryRepository contactInquiryRepository;
    private final JobApplicationRepository jobApplicationRepository;

    // ─────────────────────────────────────────────────────────────────────────
    // CONTACT INQUIRIES
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Lists contact inquiries with optional status + search filter, newest first.
     */
    @GetMapping("/contact-inquiries")
    public ResponseEntity<PageResponse<AdminInquiryResponse>> listInquiries(
            @RequestParam(defaultValue = "ALL") String status,
            @RequestParam(defaultValue = "") String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            @RequestParam(defaultValue = "desc") String sort) {

        log.info("ADMIN GET /contact-inquiries status={} search='{}' page={}", status, search, page);

        Sort.Direction direction = "asc".equalsIgnoreCase(sort) ? Sort.Direction.ASC : Sort.Direction.DESC;
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(direction, "createdAt"));

        String statusParam = "ALL".equals(status) ? null : status;
        String searchParam = search.isBlank() ? null : search;

        var inquiryPage = contactInquiryRepository.searchInquiries(statusParam, searchParam, pageRequest);
        var response = PageResponse.from(inquiryPage, this::toInquiryResponse);
        return ResponseEntity.ok(response);
    }

    /**
     * Gets a single contact inquiry by its database ID.
     */
    @GetMapping("/contact-inquiries/{id}")
    public ResponseEntity<AdminInquiryResponse> getInquiry(@PathVariable Long id) {
        log.info("ADMIN GET /contact-inquiries/{}", id);
        ContactInquiry inquiry = contactInquiryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Contact inquiry not found: " + id));
        return ResponseEntity.ok(toInquiryResponse(inquiry));
    }

    /**
     * Updates a contact inquiry's status (state-machine mutation).
     *
     * <p>Accepted transitions: NEW → IN_REVIEW → CONTACTED → CLOSED
     */
    @PatchMapping("/contact-inquiries/{id}/status")
    public ResponseEntity<AdminInquiryResponse> updateInquiryStatus(
            @PathVariable Long id,
            @Valid @RequestBody AdminStatusUpdateRequest request) {

        log.info("ADMIN PATCH /contact-inquiries/{}/status → {}", id, request.getStatus());
        ContactInquiry inquiry = contactInquiryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Contact inquiry not found: " + id));

        inquiry.setStatus(request.getStatus());
        contactInquiryRepository.save(inquiry);
        return ResponseEntity.ok(toInquiryResponse(inquiry));
    }

    /**
     * Permanently deletes a contact inquiry.
     */
    @DeleteMapping("/contact-inquiries/{id}")
    public ResponseEntity<Void> deleteInquiry(@PathVariable Long id) {
        log.info("ADMIN DELETE /contact-inquiries/{}", id);
        if (!contactInquiryRepository.existsById(id)) {
            throw new ResourceNotFoundException("Contact inquiry not found: " + id);
        }
        contactInquiryRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // JOB APPLICATIONS
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Lists job applications with optional status + search filter, newest first.
     */
    @GetMapping("/applications")
    public ResponseEntity<PageResponse<AdminApplicationResponse>> listApplications(
            @RequestParam(defaultValue = "ALL") String status,
            @RequestParam(defaultValue = "") String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            @RequestParam(defaultValue = "desc") String sort) {

        log.info("ADMIN GET /applications status={} search='{}' page={}", status, search, page);

        Sort.Direction direction = "asc".equalsIgnoreCase(sort) ? Sort.Direction.ASC : Sort.Direction.DESC;
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(direction, "createdAt"));

        String statusParam = "ALL".equals(status) ? null : status;
        String searchParam = search.isBlank() ? null : search;

        var appPage = jobApplicationRepository.searchApplications(statusParam, searchParam, pageRequest);
        var response = PageResponse.from(appPage, this::toApplicationResponse);
        return ResponseEntity.ok(response);
    }

    /**
     * Gets a single job application by its database ID.
     */
    @GetMapping("/applications/{id}")
    public ResponseEntity<AdminApplicationResponse> getApplication(@PathVariable Long id) {
        log.info("ADMIN GET /applications/{}", id);
        JobApplication application = jobApplicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Job application not found: " + id));
        return ResponseEntity.ok(toApplicationResponse(application));
    }

    /**
     * Updates a job application's selection status and optional review notes.
     *
     * <p>Accepted statuses: PENDING | IN_REVIEW | SHORTLISTED | REJECTED | HIRED
     */
    @PatchMapping("/applications/{id}/status")
    public ResponseEntity<AdminApplicationResponse> updateApplicationStatus(
            @PathVariable Long id,
            @Valid @RequestBody AdminStatusUpdateRequest request) {

        log.info("ADMIN PATCH /applications/{}/status → {}", id, request.getStatus());
        JobApplication application = jobApplicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Job application not found: " + id));

        application.setSelectionStatus(request.getStatus());
        if (request.getReviewNotes() != null) {
            application.setReviewNotes(request.getReviewNotes());
        }
        if ("SHORTLISTED".equals(request.getStatus()) || "HIRED".equals(request.getStatus())) {
            application.setIsSelected(true);
            application.setSelectedAt(LocalDateTime.now(java.time.ZoneOffset.UTC));
        }
        jobApplicationRepository.save(application);
        return ResponseEntity.ok(toApplicationResponse(application));
    }

    /**
     * Permanently deletes a job application.
     */
    @DeleteMapping("/applications/{id}")
    public ResponseEntity<Void> deleteApplication(@PathVariable Long id) {
        log.info("ADMIN DELETE /applications/{}", id);
        if (!jobApplicationRepository.existsById(id)) {
            throw new ResourceNotFoundException("Job application not found: " + id);
        }
        jobApplicationRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // KPI STATS
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Returns KPI summary metrics for the executive dashboard banner.
     */
    @GetMapping("/stats")
    public ResponseEntity<java.util.Map<String, Long>> getStats() {
        log.info("ADMIN GET /stats");

        long totalInquiries = contactInquiryRepository.count();
        long newInquiries = contactInquiryRepository.countByStatus("NEW");
        long inReviewInquiries = contactInquiryRepository.countByStatus("IN_REVIEW");
        long contactedInquiries = contactInquiryRepository.countByStatus("CONTACTED");
        long closedInquiries = contactInquiryRepository.countByStatus("CLOSED");

        long totalApplications = jobApplicationRepository.count();
        long pendingApplications = jobApplicationRepository.countBySelectionStatus("PENDING");
        long inReviewApplications = jobApplicationRepository.countBySelectionStatus("IN_REVIEW");
        long shortlistedApplications = jobApplicationRepository.countBySelectionStatus("SHORTLISTED");
        long rejectedApplications = jobApplicationRepository.countBySelectionStatus("REJECTED");
        long hiredApplications = jobApplicationRepository.countBySelectionStatus("HIRED");

        var stats = java.util.Map.of(
                "totalInquiries", totalInquiries,
                "newInquiries", newInquiries,
                "inReviewInquiries", inReviewInquiries,
                "contactedInquiries", contactedInquiries,
                "closedInquiries", closedInquiries,
                "totalApplications", totalApplications,
                "pendingApplications", pendingApplications,
                "inReviewApplications", inReviewApplications,
                "shortlistedApplications", shortlistedApplications,
                "rejectedApplications", rejectedApplications
        );

        return ResponseEntity.ok(stats);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // MAPPERS
    // ─────────────────────────────────────────────────────────────────────────

    private AdminInquiryResponse toInquiryResponse(ContactInquiry c) {
        return AdminInquiryResponse.builder()
                .id(c.getId())
                .inquiryId(c.getInquiryId())
                .name(c.getName())
                .email(c.getEmail())
                .subject(c.getSubject())
                .message(c.getMessage())
                .isVerified(c.getIsVerified())
                .verifiedAt(c.getVerifiedAt())
                .isAcknowledged(c.getIsAcknowledged())
                .acknowledgedAt(c.getAcknowledgedAt())
                .status(c.getStatus())
                .createdAt(c.getCreatedAt())
                .build();
    }

    private AdminApplicationResponse toApplicationResponse(JobApplication j) {
        return AdminApplicationResponse.builder()
                .id(j.getId())
                .applicationId(j.getApplicationId())
                .name(j.getName())
                .email(j.getEmail())
                .phone(j.getPhone())
                .nid(j.getNid())
                .address(j.getAddress())
                .reason(j.getReason())
                .linkedin(j.getLinkedin())
                .github(j.getGithub())
                .website(j.getWebsite())
                .originalFileName(j.getOriginalFileName())
                .fileSizeBytes(j.getFileSizeBytes())
                .fileContentType(j.getFileContentType())
                .isVerified(j.getIsVerified())
                .verifiedAt(j.getVerifiedAt())
                .isAcknowledged(j.getIsAcknowledged())
                .acknowledgedAt(j.getAcknowledgedAt())
                .isSelected(j.getIsSelected())
                .selectionStatus(j.getSelectionStatus())
                .selectedAt(j.getSelectedAt())
                .reviewNotes(j.getReviewNotes())
                .createdAt(j.getCreatedAt())
                .build();
    }
}
