package com.nevolyn.officemanagement.training.entity;

import com.nevolyn.officemanagement.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.time.LocalDate;

/**
 * JPA entity representing an internal training course, technical review, or stakeholder meeting.
 *
 * <p>Maps to the {@code trainings_meetings} table (V8 migration). Documents session agendas,
 * presenters, participant rosters, duration minutes, and tangible learning/action outcomes.</p>
 */
@Entity
@Table(name = "trainings_meetings")
@EntityListeners(AuditingEntityListener.class)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TrainingMeeting {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 500)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(name = "session_type", nullable = false, length = 50)
    private SessionType type;

    @Column(name = "session_date", nullable = false)
    private LocalDate sessionDate;

    @Column(name = "trainer_presenter", length = 255)
    private String trainerPresenter;

    @Column(columnDefinition = "TEXT")
    private String participants;

    @Column(name = "duration_minutes", nullable = false)
    @Builder.Default
    private Integer durationMinutes = 60;

    @Column(columnDefinition = "TEXT") private String notes;
    @Column(columnDefinition = "TEXT") private String outcome;
    @Column(columnDefinition = "TEXT") private String remarks;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    public enum SessionType {
        TRAINING("Training"),
        MEETING("Meeting"),
        TECHNICAL_REVIEW("Technical Review");
        private final String displayName;
        SessionType(String d) { this.displayName = d; }
        public String getDisplayName() { return displayName; }
    }
}
