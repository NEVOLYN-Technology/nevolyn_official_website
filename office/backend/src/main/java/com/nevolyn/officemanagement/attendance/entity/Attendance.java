package com.nevolyn.officemanagement.attendance.entity;

import com.nevolyn.officemanagement.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;

/**
 * Daily attendance record for an employee.
 *
 * <p>Maps to the {@code attendance} table (V2 migration).
 * One record per employee per day — enforced by UNIQUE (user_id, date).
 *
 * <p>Business rules (from AttendancePolicy):
 * <ul>
 *   <li>check_in_time <= 12:00 → Late Status: On Time</li>
 *   <li>check_in_time > 12:00  → Late Status: Late</li>
 *   <li>check_out_time < 17:00 → Early Checkout: Yes</li>
 *   <li>check_out_time >= 17:00 → Early Checkout: No</li>
 * </ul>
 */
@Entity
@Table(
    name = "attendance",
    uniqueConstraints = @UniqueConstraint(
        name = "uq_attendance_user_date",
        columnNames = {"user_id", "date"}
    )
)
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Attendance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private LocalDate date;

    @Column(name = "check_in_time")
    private LocalTime checkInTime;

    @Column(name = "check_out_time")
    private LocalTime checkOutTime;

    @Column(name = "total_hours", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal totalHours = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(name = "late_status", nullable = false, length = 50)
    @Builder.Default
    private LateStatus lateStatus = LateStatus.ON_TIME;

    @Enumerated(EnumType.STRING)
    @Column(name = "early_checkout", nullable = false, length = 50)
    @Builder.Default
    private EarlyCheckout earlyCheckout = EarlyCheckout.NO;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    @Builder.Default
    private AttendanceStatus status = AttendanceStatus.PRESENT;

    @Column(name = "ip_address", length = 45)
    private String ipAddress;

    @Column(name = "user_agent")
    private String userAgent;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    /** Whether the employee has checked in but not yet checked out. */
    @Transient
    public boolean isInHouse() {
        return checkInTime != null && checkOutTime == null;
    }

    /** Whether the employee has completed both check-in and check-out. */
    @Transient
    public boolean isPresent() {
        return checkInTime != null && checkOutTime != null;
    }

    public enum LateStatus {
        ON_TIME("On Time"),
        LATE("Late");

        private final String displayName;
        LateStatus(String displayName) { this.displayName = displayName; }
        public String getDisplayName() { return displayName; }
    }

    public enum EarlyCheckout {
        YES("Yes"),
        NO("No");

        private final String displayName;
        EarlyCheckout(String displayName) { this.displayName = displayName; }
        public String getDisplayName() { return displayName; }
    }

    public enum AttendanceStatus {
        PRESENT, ABSENT
    }
}
