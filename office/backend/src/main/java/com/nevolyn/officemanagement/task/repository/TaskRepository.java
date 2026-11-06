package com.nevolyn.officemanagement.task.repository;

import com.nevolyn.officemanagement.task.entity.Task;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

/**
 * Spring Data JPA repository for {@link Task} entities.
 *
 * <p>
 * Provides indexed lookups by assignee and project, deadline sorting,
 * status counting, and eager-fetched queries for active task workloads.
 * </p>
 */
@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

  /** All tasks assigned to a specific user, newest first. */
  Page<Task> findByAssignedToIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

  List<Task> findByAssignedToIdOrderByDeadlineAsc(Long userId);

  List<Task> findTop5ByAssignedToIdAndStatusInOrderByDeadlineAsc(Long userId, Collection<Task.TaskStatus> statuses);

  /** All tasks for a specific project. */
  List<Task> findByProjectIdOrderByDeadlineAsc(Long projectId);

  long countByProjectId(Long projectId);

  /** Admin: all tasks paginated. */
  Page<Task> findAllByOrderByCreatedAtDesc(Pageable pageable);

  @Query("SELECT COUNT(t) FROM Task t WHERE t.assignedTo.id = :userId AND t.status = :status")
  long countByUserAndStatus(@Param("userId") Long userId, @Param("status") Task.TaskStatus status);

  @Query("SELECT COUNT(t) FROM Task t WHERE t.status = :status")
  long countByStatus(@Param("status") Task.TaskStatus status);

  long countByStatusIn(Collection<Task.TaskStatus> statuses);

  @Query("""
      SELECT t FROM Task t JOIN FETCH t.assignedTo JOIN FETCH t.createdBy
      WHERE t.assignedTo.id = :userId
        AND t.status IN ('PENDING', 'IN_PROGRESS')
      ORDER BY t.deadline ASC NULLS LAST
      """)
  List<Task> findActiveTasks(@Param("userId") Long userId);
}
