package com.saturn.rnd.repository;

import com.saturn.rnd.model.TeamMemberEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TeamMemberRepository extends JpaRepository<TeamMemberEntity, Long> {
    List<TeamMemberEntity> findAllByOrderByDisplayOrderAsc();
    List<TeamMemberEntity> findByDepartmentOrderByDisplayOrderAsc(String department);
}
