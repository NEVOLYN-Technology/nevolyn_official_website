package com.nevolyn.officemanagement.worklog.entity;

import com.nevolyn.officemanagement.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

/**
 * JPA entity representing an employee's daily work log and accomplishment journal.
 *
 * <p>Maps to the {@code work_logs} table (V9 migration). Enforces uniqueness per user and date,
 * recording tasks accomplished, hours invested, blockers encountered, and forward-looking plans.</p>
 */
@Entity
@Table(
    name = "work_logs",
    uniqueConstraints = @UniqueConstraint(
        name = "uq_work_logs_user_date",
        columnNames = {"user_id", "log_date"}
    )
)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class WorkLog {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "log_date", nullable = false)
    private LocalDate logDate;

    @Column(name = "work_completed", nullable = false, columnDefinition = "TEXT")
    private String workCompleted;

    @Column(name = "time_spent_hours", precision = 4, scale = 2)
    @Builder.Default
    private BigDecimal timeSpentHours = BigDecimal.ZERO;

    @Column(columnDefinition = "TEXT") private String issues;
    @Column(name = "next_action", columnDefinition = "TEXT") private String nextAction;
    @Column(columnDefinition = "TEXT") private String remarks;

    @Column(name = "submitted_at", nullable = false, updatable = false)
    @Builder.Default
    private Instant submittedAt = Instant.now();
}
