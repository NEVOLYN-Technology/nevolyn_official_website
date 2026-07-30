package com.saturn.rnd.model;

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

    @Column(nullable = false, length = 255)
    private String originalFileName;

    @Column(length = 64)
    private String verificationToken;

    @Builder.Default
    @Column(nullable = false)
    private Boolean isVerified = false;

    private LocalDateTime verifiedAt;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
