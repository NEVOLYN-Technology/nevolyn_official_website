package com.nevolyn.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nevolyn.dto.ContactRequest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration test suite for Contact Inquiry REST API endpoint (`POST /api/v1/contact`).
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ContactControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("POST /api/v1/contact - Should return 201 Created when payload is valid")
    void submitContactInquiry_ValidPayload_Returns201Created() throws Exception {
        ContactRequest request = new ContactRequest();
        request.setName("John Doe");
        request.setEmail("john.doe@example.com");
        request.setSubject("FABINS Demonstration Request");
        request.setMessage("We would like to schedule a demonstration of the FABINS fabric fault inspection system.");

        mockMvc.perform(post("/api/v1/contact")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status", is("success")))
                .andExpect(jsonPath("$.code", is(201)))
                .andExpect(jsonPath("$.data.inquiryId", startsWith("INQ-")))
                .andExpect(jsonPath("$.data.requiresVerification", is(false)))
                .andExpect(jsonPath("$.data.isVerified", is(true)))
                .andExpect(jsonPath("$.message", containsString("confirmation receipt has been sent")));
    }

    @Test
    @DisplayName("POST /api/v1/contact - Should return 400 Bad Request when email format is invalid")
    void submitContactInquiry_InvalidEmail_Returns400BadRequest() throws Exception {
        ContactRequest request = new ContactRequest();
        request.setName("John Doe");
        request.setEmail("not-an-email"); // Invalid email
        request.setSubject("Subject");
        request.setMessage("Message content...");

        mockMvc.perform(post("/api/v1/contact")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status", is("error")))
                .andExpect(jsonPath("$.code", is(400)))
                .andExpect(jsonPath("$.errors", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$.errors[0].field", is("email")));
    }
}
