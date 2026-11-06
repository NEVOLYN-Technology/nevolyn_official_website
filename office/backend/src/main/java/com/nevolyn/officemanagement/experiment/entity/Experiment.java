package com.nevolyn.officemanagement.experiment.entity;

import com.nevolyn.officemanagement.project.entity.RndProject;
import com.nevolyn.officemanagement.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.time.LocalDate;

/**
 * JPA entity representing a scientific experiment or laboratory trial.
 *
 * <p>Maps to the {@code experiments} table (V5 migration). Records formal hypotheses,
 * methodologies, empirical findings, and scientific deductions under an R&D project.</p>
 */
@Entity
@Table(name = "experiments")
@EntityListeners(AuditingEntityListener.class)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Experiment {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "project_id", nullable = false)
    private RndProject project;

    @Column(nullable = false, length = 500)
    private String title;

    @Column(name = "experiment_date", nullable = false)
    private LocalDate experimentDate;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "researcher_id", nullable = false)
    private User researcher;

    @Column(columnDefinition = "TEXT") private String objective;
    @Column(columnDefinition = "TEXT") private String procedure;
    @Column(columnDefinition = "TEXT") private String result;
    @Column(columnDefinition = "TEXT") private String observation;
    @Column(columnDefinition = "TEXT") private String conclusion;
    @Column(columnDefinition = "TEXT") private String remarks;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
}
