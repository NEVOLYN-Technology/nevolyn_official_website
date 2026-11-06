package com.nevolyn.officemanagement.development.repository;

import com.nevolyn.officemanagement.development.entity.DevelopmentRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Spring Data JPA repository for {@link DevelopmentRecord} entities.
 *
 * <p>Provides indexed lookup and counting of product development logs associated
 * with specific research and development initiatives.</p>
 */
@Repository
public interface DevelopmentRecordRepository extends JpaRepository<DevelopmentRecord, Long> {

    /**
     * Retrieves all development records associated with a given project ordered by record date descending.
     *
     * @param projectId the primary key ID of the project
     * @return chronologically ordered list of development records
     */
    List<DevelopmentRecord> findByProjectIdOrderByRecordDateDesc(Long projectId);

    /**
     * Counts the total number of development records logged under a specific project.
     *
     * @param projectId the primary key ID of the project
     * @return count of development records
     */
    long countByProjectId(Long projectId);
}

