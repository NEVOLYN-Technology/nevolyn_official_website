package com.saturn.rnd.model;

import jakarta.persistence.*;
import lombok.*;

/**
 * JPA Entity storing dynamic R&D engineering team members in database.
 */
@Entity
@Table(name = "team_members")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TeamMemberEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, length = 100)
    private String title;

    @Column(nullable = false, length = 100)
    private String department;

    @Column(columnDefinition = "TEXT")
    private String bio;

    @Column(length = 255)
    private String specializations;

    @Column(length = 150)
    private String email;

    @Column(length = 255)
    private String image;

    @Column(length = 255)
    private String github;

    @Column(length = 255)
    private String linkedin;

    @Column(nullable = false)
    private Integer displayOrder;
}
