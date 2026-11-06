package com.nevolyn.officemanagement.user.repository;

import com.nevolyn.officemanagement.user.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Spring Data JPA repository for {@link User} entities.
 *
 * <p>Provides indexed credentials and identifier lookups, active employee roster queries,
 * headcount metrics, and case-insensitive employee search.</p>
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * Finds a user by unique system username.
     *
     * @param username user login handle
     * @return an {@link Optional} containing the user if found
     */
    Optional<User> findByUsername(String username);

    /**
     * Finds a user by organizational employee ID code.
     *
     * @param employeeId corporate employee identifier (e.g. "nev_rahinrahman_2026-01-15")
     * @return an {@link Optional} containing the user if found
     */
    Optional<User> findByEmployeeId(String employeeId);

    /**
     * Checks whether a username is already assigned.
     *
     * @param username username to verify
     * @return {@code true} if username exists, {@code false} otherwise
     */
    boolean existsByUsername(String username);

    /**
     * Checks whether an employee ID is already assigned.
     *
     * @param employeeId corporate employee identifier to verify
     * @return {@code true} if employee ID exists, {@code false} otherwise
     */
    boolean existsByEmployeeId(String employeeId);

    /**
     * Retrieves all active users of a specific role ordered by full legal name.
     *
     * @param role user role filter
     * @return list of active users
     */
    List<User> findByRoleAndIsActiveTrueOrderByFullNameAsc(User.UserRole role);

    /**
     * Retrieves all active team members across all roles (super_admin, admin, employee) ordered by full name.
     *
     * @return list of all active staff members
     */
    List<User> findByIsActiveTrueOrderByFullNameAsc();

    /**
     * Retrieves a paginated slice of users matching a specific role.
     *
     * @param role role filter
     * @param pageable pagination parameters
     * @return page of users
     */
    Page<User> findByRole(User.UserRole role, Pageable pageable);

    /**
     * Counts users with a specific role.
     *
     * @param role user role filter
     * @return count of users with the given role
     */
    long countByRole(User.UserRole role);

    /**
     * Counts all active team members currently registered in the organization.
     *
     * @return count of active personnel
     */
    @Query("""
            SELECT COUNT(u) FROM User u
            WHERE u.isActive = true
            """)
    long countActiveEmployees();

    /**
     * Searches employees by name, username, or employee ID.
     *
     * @param role user role filter
     * @param query search substring
     * @return matching users ordered by full name
     */
    @Query("""
            SELECT u FROM User u
            WHERE u.role = :role
              AND (LOWER(u.fullName) LIKE LOWER(CONCAT('%', :query, '%'))
                OR LOWER(u.username) LIKE LOWER(CONCAT('%', :query, '%'))
                OR LOWER(u.employeeId) LIKE LOWER(CONCAT('%', :query, '%')))
            ORDER BY u.fullName ASC
            """)
    List<User> searchByRoleAndQuery(@Param("role") User.UserRole role, @Param("query") String query);
}
