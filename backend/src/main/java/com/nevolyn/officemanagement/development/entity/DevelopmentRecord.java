package com.nevolyn.officemanagement.development.entity;

import com.nevolyn.officemanagement.project.entity.RndProject;
import com.nevolyn.officemanagement.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.time.LocalDate;

/**
 * JPA entity representing a technical product development milestone or iteration record.
 *
 * <p>Maps to the {@code development_records} table (V6 migration). Tracks product prototyping,
 * QA release stages, version revisions, empirical outcomes, blocker issues, and subsequent steps.</p>
 */
@Entity
@Table(name = "development_records")
@EntityListeners(AuditingEntityListener.class)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DevelopmentRecord {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "project_id", nullable = false)
    private RndProject project;

    @Column(name = "product_name", nullable = false, length = 255)
    private String productName;

    @Column(nullable = false, length = 100)
    private String stage;

    @Column(length = 50)
    private String version;

    @Column(name = "record_date", nullable = false)
    private LocalDate recordDate;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "responsible_id", nullable = false)
    private User responsible;

    @Column(columnDefinition = "TEXT") private String result;
    @Column(columnDefinition = "TEXT") private String issues;
    @Column(name = "next_action", columnDefinition = "TEXT") private String nextAction;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
}
