package com.nevolyn.officemanagement.experiment.repository;

import com.nevolyn.officemanagement.experiment.entity.Experiment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Spring Data JPA repository for {@link Experiment} entities.
 *
 * <p>Provides indexed persistence queries and metric counts for scientific experiments
 * and research trials conducted within specific projects.</p>
 */
@Repository
public interface ExperimentRepository extends JpaRepository<Experiment, Long> {

    /**
     * Retrieves all experiments linked to a project in reverse chronological order.
     *
     * @param projectId the primary key ID of the parent project
     * @return list of matching experiments
     */
    List<Experiment> findByProjectIdOrderByExperimentDateDesc(Long projectId);

    /**
     * Counts the total number of experimental trials conducted under a given project.
     *
     * @param projectId the primary key ID of the parent project
     * @return total count of experiment records
     */
    long countByProjectId(Long projectId);
}

