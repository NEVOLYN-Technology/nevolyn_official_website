package com.saturn.rnd.service;

import com.saturn.rnd.dto.TeamMemberDto;
import com.saturn.rnd.model.TeamMemberEntity;
import com.saturn.rnd.repository.TeamMemberRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Service retrieving active dynamic R&D engineering staff profiles.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class TeamService {

    private final TeamMemberRepository repository;

    public List<TeamMemberDto> getTeamMembers(String department) {
        log.debug("Querying repository for team members (department filter='{}')", department);

        List<TeamMemberEntity> entities = (department != null && !department.isBlank())
                ? repository.findByDepartmentOrderByDisplayOrderAsc(department)
                : repository.findAllByOrderByDisplayOrderAsc();

        log.debug("Database returned {} TeamMemberEntity records", entities.size());

        return entities.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    private TeamMemberDto mapToDto(TeamMemberEntity entity) {
        List<String> specs = (entity.getSpecializations() != null)
                ? Arrays.asList(entity.getSpecializations().split("\\s*,\\s*"))
                : Collections.emptyList();

        Map<String, String> social = new HashMap<>();
        if (entity.getGithub() != null) social.put("github", entity.getGithub());
        if (entity.getLinkedin() != null) social.put("linkedin", entity.getLinkedin());

        return TeamMemberDto.builder()
                .id(entity.getId())
                .name(entity.getName())
                .title(entity.getTitle())
                .department(entity.getDepartment())
                .bio(entity.getBio())
                .specializations(specs)
                .email(entity.getEmail())
                .image(entity.getImage())
                .social(social)
                .displayOrder(entity.getDisplayOrder())
                .build();
    }
}
