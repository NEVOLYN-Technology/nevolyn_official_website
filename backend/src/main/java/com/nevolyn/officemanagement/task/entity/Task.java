package com.nevolyn.officemanagement.task.entity;

import com.nevolyn.officemanagement.project.entity.RndProject;
import com.nevolyn.officemanagement.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.time.LocalDate;

/**
 * Delegated task assigned to an employee, optionally linked to a project.
 *
 * <p>Maps to the {@code tasks} table (V4 migration).
 */
@Entity
@Table(name = "tasks")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id")
    private RndProject project;

    @Column(nullable = false, length = 500)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "assigned_to_id", nullable = false)
    private User assignedTo;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column
    private LocalDate deadline;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    @Builder.Default
    private TaskPriority priority = TaskPriority.MEDIUM;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    @Builder.Default
    private TaskStatus status = TaskStatus.PENDING;

    @Column(name = "progress_pct", nullable = false)
    @Builder.Default
    private Integer progressPct = 0;

    @Column(columnDefinition = "TEXT")
    private String remarks;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    public enum TaskPriority {
        LOW("Low"), MEDIUM("Medium"), HIGH("High"), CRITICAL("Critical");
        private final String displayName;
        TaskPriority(String d) { this.displayName = d; }
        public String getDisplayName() { return displayName; }
    }

    public enum TaskStatus {
        PENDING("Pending"), IN_PROGRESS("In Progress"), COMPLETED("Completed"), CANCELLED("Cancelled");
        private final String displayName;
        TaskStatus(String d) { this.displayName = d; }
        public String getDisplayName() { return displayName; }
    }
}
