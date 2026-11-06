package com.nevolyn.officemanagement.attendance.repository;

import com.nevolyn.officemanagement.attendance.entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Spring Data JPA repository for {@link Attendance} entities.
 *
 * <p>Provides indexed lookups by user and calendar date, in-house headcount counting,
 * and fetch-joined queries for daily rosters and monthly payroll/compliance reports.</p>
 */
@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

    /**
     * Finds the attendance record for a specific user on a given date.
     *
     * @param userId the primary key ID of the user
     * @param date the calendar date
     * @return an {@link Optional} containing the attendance record if found
     */
    Optional<Attendance> findByUserIdAndDate(Long userId, LocalDate date);

    /**
     * Checks if an attendance record already exists for a user on a given date.
     *
     * @param userId the primary key ID of the user
     * @param date the calendar date
     * @return {@code true} if an attendance record exists, {@code false} otherwise
     */
    boolean existsByUserIdAndDate(Long userId, LocalDate date);

    /**
     * Retrieves all attendance records for a user ordered by calendar date descending.
     *
     * @param userId the primary key ID of the user
     * @return chronologically ordered list of attendance records
     */
    @Query("SELECT a FROM Attendance a JOIN FETCH a.user WHERE a.user.id = :userId ORDER BY a.date DESC")
    List<Attendance> findByUserIdOrderByDateDesc(@Param("userId") Long userId);

    /**
     * Retrieves all attendance records for a specific date with associated user profiles eagerly loaded.
     *
     * @param date the calendar date
     * @return list of attendance records ordered by employee name
     */
    @Query("SELECT a FROM Attendance a JOIN FETCH a.user WHERE a.date = :date ORDER BY a.user.fullName")
    List<Attendance> findAllByDateWithUser(@Param("date") LocalDate date);

    /**
     * Counts the number of employees currently inside the office (checked in but not yet checked out).
     *
     * @param date the calendar date (usually today)
     * @return current in-house employee count
     */
    @Query("""
            SELECT COUNT(a) FROM Attendance a
            WHERE a.date = :date
              AND a.checkInTime IS NOT NULL
              AND a.checkOutTime IS NULL
            """)
    long countInHouseOnDate(@Param("date") LocalDate date);

    /**
     * Retrieves attendance records for a user within an inclusive date range.
     *
     * @param userId the primary key ID of the user
     * @param startDate the beginning date of the range
     * @param endDate the ending date of the range
     * @return list of attendance records ordered chronologically
     */
    @Query("""
            SELECT a FROM Attendance a
            WHERE a.user.id = :userId
              AND a.date BETWEEN :startDate AND :endDate
            ORDER BY a.date
            """)
    List<Attendance> findByUserAndDateBetween(
            @Param("userId") Long userId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    /**
     * Retrieves all employee attendance records for an inclusive date range (used for monthly reports).
     *
     * @param startDate the beginning date of the range
     * @param endDate the ending date of the range
     * @return list of attendance records with users eagerly loaded
     */
    @Query("""
            SELECT a FROM Attendance a JOIN FETCH a.user u
            WHERE a.date BETWEEN :startDate AND :endDate
            ORDER BY u.fullName, a.date
            """)
    List<Attendance> findAllByDateBetweenForEmployees(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );
}

