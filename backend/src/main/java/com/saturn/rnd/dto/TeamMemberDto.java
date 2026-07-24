package com.saturn.rnd.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

/**
 * Data transfer object for dynamic engineering team staff.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TeamMemberDto {
    private Long id;
    private String name;
    private String title;
    private String department;
    private String bio;
    private List<String> specializations;
    private String email;
    private String image;
    private Map<String, String> social;
    private Integer displayOrder;
}
