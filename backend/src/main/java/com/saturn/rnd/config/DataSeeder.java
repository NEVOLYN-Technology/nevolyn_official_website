package com.saturn.rnd.config;

import com.saturn.rnd.model.TeamMemberEntity;
import com.saturn.rnd.repository.TeamMemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

/**
 * Seeds initial dynamic team member data into database on application startup if table is empty.
 */
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final TeamMemberRepository teamMemberRepository;

    @Override
    public void run(String... args) {
        if (teamMemberRepository.count() == 0) {
            teamMemberRepository.save(TeamMemberEntity.builder()
                    .name("Tanvir Ahmed")
                    .title("Computer Vision Engineer")
                    .department("Industrial AI")
                    .bio("Specializes in real-time defect segmentation models and Hikrobot camera SDK integration.")
                    .specializations("PyTorch, OpenCV, YOLOv8")
                    .email("tanvir@saturntextiles.com")
                    .image("/tanvir-photo.png")
                    .github("https://github.com/tanvir")
                    .linkedin("https://linkedin.com/in/tanvir")
                    .displayOrder(1)
                    .build());
        }
    }
}
