package com.nevolyn.officemanagement.project.repository;

import com.nevolyn.officemanagement.project.entity.RndProject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

/**
 * Spring Data JPA repository for {@link RndProject} entities.
 *
 * <p>Provides indexed code lookups, responsible lead filtering, status counts,
 * and case-insensitive query searching across research and development portfolios.</p>
 */
@Repository
public interface RndProjectRepository extends JpaRepository<RndProject, Long> {

    /**
     * Finds a project by its unique alphanumeric project code.
     *
     * @param code unique project code (e.g. "PRJ-001")
     * @return an {@link Optional} containing the project if found
     */
    Optional<RndProject> findByCode(String code);

    /**
     * Checks if a project code is already registered in the system.
     *
     * @param code the project code to test
     * @return {@code true} if code exists, {@code false} otherwise
     */
    boolean existsByCode(String code);

    /**
     * Retrieves all projects having the specified status, ordered by creation date descending.
     *
     * @param status the project lifecycle status
     * @return list of projects matching the status
     */
    List<RndProject> findByStatusOrderByCreatedAtDesc(RndProject.ProjectStatus status);

    /**
     * Retrieves all projects whose status matches any in the provided collection.
     *
     * @param statuses collection of statuses to include
     * @return list of projects matching any of the statuses
     */
    List<RndProject> findByStatusInOrderByCreatedAtDesc(Collection<RndProject.ProjectStatus> statuses);

    /**
     * Retrieves a paginated slice of all projects ordered by creation date descending.
     *
     * @param pageable pagination parameters
     * @return page of projects
     */
    Page<RndProject> findAllByOrderByCreatedAtDesc(Pageable pageable);

    /**
     * Retrieves all projects assigned to a specific responsible lead.
     *
     * @param responsibleId primary key ID of the responsible user
     * @return list of projects
     */
    List<RndProject> findByResponsibleIdOrderByCreatedAtDesc(Long responsibleId);

    /**
     * Retrieves the top 5 urgent active projects assigned to a user ordered by target completion date.
     *
     * @param responsibleId primary key ID of the responsible lead
     * @param statuses active statuses to query
     * @return top 5 matching projects
     */
    List<RndProject> findTop5ByResponsibleIdAndStatusInOrderByTargetDateAsc(Long responsibleId, Collection<RndProject.ProjectStatus> statuses);

    /**
     * Case-insensitively searches projects matching either name or code fragments.
     *
     * @param query the search substring
     * @return matching projects ordered by creation timestamp
     */
    @Query("""
            SELECT p FROM RndProject p
            WHERE LOWER(p.name) LIKE LOWER(CONCAT('%', :query, '%'))
               OR LOWER(p.code) LIKE LOWER(CONCAT('%', :query, '%'))
            ORDER BY p.createdAt DESC
            """)
    List<RndProject> searchByNameOrCode(@Param("query") String query);

    /**
     * Counts the number of projects in a given lifecycle status.
     *
     * @param status the target status
     * @return project count
     */
    @Query("SELECT COUNT(p) FROM RndProject p WHERE p.status = :status")
    long countByStatus(@Param("status") RndProject.ProjectStatus status);

    /**
     * Counts the number of projects whose status matches any in the provided collection.
     *
     * @param statuses collection of statuses
     * @return project count
     */
    long countByStatusIn(Collection<RndProject.ProjectStatus> statuses);
}

