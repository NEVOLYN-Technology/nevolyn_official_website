package com.nevolyn.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * JPA Entity storing candidate job application details and uploaded resume
 * paths.
 */
@Entity
@Table(name = "job_applications")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 64)
    private String applicationId;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, length = 150)
    private String email;

    @Column(nullable = false, length = 30)
    private String phone;

    @Column(nullable = false, length = 50)
    private String nid;

    @Column(nullable = false, length = 250)
    private String address;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String reason;

    @Column(length = 255)
    private String linkedin;

    @Column(length = 255)
    private String github;

    @Column(length = 255)
    private String website;

    @Column(nullable = false, length = 500)
    private String resumePath;

    @Column(length = 500)
    private String dossierPath;

    @Column(nullable = false, length = 255)
    private String originalFileName;

    private Long fileSizeBytes;

    @Column(length = 100)
    private String fileContentType;

    @Column(length = 64)
    private String verificationToken;

    @Builder.Default
    @Column(nullable = false)
    private Boolean isVerified = false;

    private LocalDateTime verifiedAt;

    @Builder.Default
    @Column(nullable = false)
    private Boolean isAcknowledged = false;

    private LocalDateTime acknowledgedAt;

    @Builder.Default
    @Column(nullable = false)
    private Boolean isSelected = false;

    @Column(length = 32)
    private String selectionStatus;

    private LocalDateTime selectedAt;

    @Column(columnDefinition = "TEXT")
    private String reviewNotes;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now(java.time.ZoneOffset.UTC);
    }
}
