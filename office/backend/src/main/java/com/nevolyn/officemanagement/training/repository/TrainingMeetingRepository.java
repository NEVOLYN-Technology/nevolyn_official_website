package com.nevolyn.officemanagement.training.repository;

import com.nevolyn.officemanagement.training.entity.TrainingMeeting;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Spring Data JPA repository for {@link TrainingMeeting} entities.
 *
 * <p>Provides indexed retrieval and pagination of internal training workshops,
 * client conferences, and project synchronization meetings.</p>
 */
@Repository
public interface TrainingMeetingRepository extends JpaRepository<TrainingMeeting, Long> {

    /**
     * Retrieves all sessions ordered by scheduled session date descending.
     *
     * @return chronologically ordered list of sessions
     */
    List<TrainingMeeting> findAllByOrderBySessionDateDesc();

    /**
     * Retrieves a paginated slice of sessions ordered by session date descending.
     *
     * @param pageable pagination parameters
     * @return page of sessions
     */
    Page<TrainingMeeting> findAllByOrderBySessionDateDesc(Pageable pageable);

    /**
     * Filters sessions by session classification type (e.g. TRAINING, MEETING, SEMINAR).
     *
     * @param type the session category
     * @return list of matching sessions
     */
    List<TrainingMeeting> findByTypeOrderBySessionDateDesc(TrainingMeeting.SessionType type);
}

