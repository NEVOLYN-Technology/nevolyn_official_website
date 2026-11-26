package com.nevolyn.officemanagement.file.repository;

import com.nevolyn.officemanagement.file.entity.UploadedFile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Spring Data JPA repository for {@link UploadedFile} entities.
 *
 * <p>Provides polymorphic lookups and attachment counts linking stored documents
 * to various domain entities (tasks, projects, experiments, etc.).</p>
 */
@Repository
public interface UploadedFileRepository extends JpaRepository<UploadedFile, Long> {

    /**
     * Retrieves all files attached to a specific domain entity.
     *
     * @param entityType the domain category of the target entity
     * @param entityId the primary key ID of the target entity
     * @return list of attached files
     */
    List<UploadedFile> findByEntityTypeAndEntityId(UploadedFile.FileEntityType entityType, Long entityId);

    /**
     * Counts the total number of files attached to a specific domain entity.
     *
     * @param entityType the domain category of the target entity
     * @param entityId the primary key ID of the target entity
     * @return attachment count
     */
    long countByEntityTypeAndEntityId(UploadedFile.FileEntityType entityType, Long entityId);
}

