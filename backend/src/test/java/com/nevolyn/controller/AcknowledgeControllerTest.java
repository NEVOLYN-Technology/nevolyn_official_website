package com.nevolyn.controller;

import com.nevolyn.model.ContactInquiry;
import com.nevolyn.model.JobApplication;
import com.nevolyn.repository.ContactInquiryRepository;
import com.nevolyn.repository.JobApplicationRepository;
import com.nevolyn.service.EmailService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.containsString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AcknowledgeControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JobApplicationRepository applicationRepository;

    @Autowired
    private ContactInquiryRepository contactRepository;

    @MockitoBean
    private EmailService emailService;

    @Test
    @DisplayName("GET /api/v1/acknowledge - Should send acknowledgment email and return HTML when JobApplication trackingId exists")
    void acknowledgeJobApplication_Success() throws Exception {
        String appId = "APP-TEST-999";
        JobApplication app = JobApplication.builder()
                .applicationId(appId)
                .name("Alice Applicant")
                .email("alice@example.com")
                .phone("1234567890")
                .address("Dhaka")
                .reason("Test reason")
                .resumePath("/tmp/resume.pdf")
                .originalFileName("resume.pdf")
                .isVerified(true)
                .build();
        applicationRepository.save(app);

        mockMvc.perform(get("/api/v1/acknowledge").param("trackingId", appId))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("Acknowledgement Sent!")))
                .andExpect(content().string(containsString("Alice Applicant")));

        verify(emailService).sendUserAcknowledgementEmail(
                eq("alice@example.com"),
                eq("Alice Applicant"),
                eq(appId),
                eq("Job Application")
        );
    }

    @Test
    @DisplayName("GET /api/v1/acknowledge - Should send acknowledgment email and return HTML when ContactInquiry trackingId exists")
    void acknowledgeContactInquiry_Success() throws Exception {
        String inqId = "INQ-TEST-888";
        ContactInquiry inquiry = ContactInquiry.builder()
                .inquiryId(inqId)
                .name("Bob Inquirer")
                .email("bob@example.com")
                .subject("Test Subject")
                .message("Test message")
                .isVerified(true)
                .build();
        contactRepository.save(inquiry);

        mockMvc.perform(get("/api/v1/acknowledge").param("trackingId", inqId))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("Acknowledgement Sent!")))
                .andExpect(content().string(containsString("Bob Inquirer")));

        verify(emailService).sendUserAcknowledgementEmail(
                eq("bob@example.com"),
                eq("Bob Inquirer"),
                eq(inqId),
                eq("Contact Inquiry")
        );
    }

    @Test
    @DisplayName("GET /api/v1/acknowledge - Should return Not Found HTML when trackingId does not exist")
    void acknowledgeSubmission_NotFound() throws Exception {
        mockMvc.perform(get("/api/v1/acknowledge").param("trackingId", "UNKNOWN-ID"))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("Reference Code Not Found")));

        verifyNoInteractions(emailService);
    }

    @Test
    @DisplayName("POST /api/v1/acknowledge - Should support POST method and return HTML")
    void acknowledgeSubmission_PostMethod() throws Exception {
        mockMvc.perform(post("/api/v1/acknowledge").param("trackingId", "UNKNOWN-ID"))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("Reference Code Not Found")));
    }
}
