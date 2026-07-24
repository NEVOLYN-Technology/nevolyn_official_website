package com.saturn.rnd.controller;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration test suite for Job Applications & CV Upload REST API endpoint (`POST /api/v1/applications`).
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ApplicationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("POST /api/v1/applications - Should return 201 Created when multipart form data and PDF CV are valid")
    void submitApplication_ValidMultipartRequest_Returns201Created() throws Exception {
        MockMultipartFile resumeFile = new MockMultipartFile(
                "resume",
                "sample_resume.pdf",
                "application/pdf",
                "%PDF-1.4 Mock PDF Resume Content".getBytes()
        );

        mockMvc.perform(multipart("/api/v1/applications")
                        .file(resumeFile)
                        .param("name", "Jane Doe")
                        .param("email", "jane.doe@example.com")
                        .param("phone", "1712345678")
                        .param("address", "Dhaka, Bangladesh")
                        .param("reason", "I am passionate about building computer vision systems for textile automation.")
                        .param("linkedin", "https://linkedin.com/in/janedoe")
                        .param("github", "https://github.com/janedoe"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status", is("success")))
                .andExpect(jsonPath("$.code", is(201)))
                .andExpect(jsonPath("$.data.applicationId", startsWith("APP-")))
                .andExpect(jsonPath("$.data.fileName", is("sample_resume.pdf")));
    }
}
