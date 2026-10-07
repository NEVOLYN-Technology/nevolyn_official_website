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
import static org.mockito.Mockito.*;
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
    @DisplayName("GET /api/v1/acknowledge - Anti-scanner safety: should render pre-flight confirmation page without dispatching email")
    void getAcknowledge_ScannerSafety_DoesNotDispatchEmail() throws Exception {
        String appId = "APP-SCAN-001";
        JobApplication app = JobApplication.builder()
                .applicationId(appId)
                .name("Scanner Test Candidate")
                .email("candidate@example.com")
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
                .andExpect(content().string(containsString("Confirm Application Evaluation")))
                .andExpect(content().string(containsString("Outgoing Email Preview")))
                .andExpect(content().string(containsString("Scanner Test Candidate")));

        // Scanner GET must never trigger email dispatch!
        verifyNoInteractions(emailService);
    }

    @Test
    @DisplayName("POST /api/v1/acknowledge - State transition: should send acknowledgment email and return result view")
    void postAcknowledgeJobApplication_Success() throws Exception {
        String appId = "APP-POST-002";
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

        mockMvc.perform(post("/api/v1/acknowledge").param("trackingId", appId))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("Acknowledgement Sent!")))
                .andExpect(content().string(containsString("Alice Applicant")));

        verify(emailService, times(1)).sendUserAcknowledgementEmail(
                eq("alice@example.com"),
                eq("Alice Applicant"),
                eq(appId),
                eq("Job Application")
        );
    }

    @Test
    @DisplayName("POST /api/v1/acknowledge - Idempotency: second request should suppress duplicate email and render Already Acknowledged")
    void postAcknowledge_Idempotency_SuppressesDuplicate() throws Exception {
        String inqId = "INQ-IDEM-003";
        ContactInquiry inquiry = ContactInquiry.builder()
                .inquiryId(inqId)
                .name("Bob Inquirer")
                .email("bob@example.com")
                .subject("Test Subject")
                .message("Test message")
                .isVerified(true)
                .build();
        contactRepository.save(inquiry);

        // First POST dispatch
        mockMvc.perform(post("/api/v1/acknowledge").param("trackingId", inqId))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("Acknowledgement Sent!")));

        verify(emailService, times(1)).sendUserAcknowledgementEmail(
                eq("bob@example.com"),
                eq("Bob Inquirer"),
                eq(inqId),
                eq("Contact Inquiry")
        );

        // Second POST - must be idempotent!
        mockMvc.perform(post("/api/v1/acknowledge").param("trackingId", inqId))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("Already Acknowledged")));

        // Verify still called exactly once!
        verify(emailService, times(1)).sendUserAcknowledgementEmail(any(), any(), any(), any());
    }

    @Test
    @DisplayName("GET /api/v1/acknowledge?confirm=true - Direct confirmation link should dispatch email")
    void getAcknowledge_WithAutoConfirm_DispatchesEmail() throws Exception {
        String inqId = "INQ-CONFIRM-004";
        ContactInquiry inquiry = ContactInquiry.builder()
                .inquiryId(inqId)
                .name("Carol Inquirer")
                .email("carol@example.com")
                .subject("Partnership")
                .message("Let's partner")
                .isVerified(true)
                .build();
        contactRepository.save(inquiry);

        mockMvc.perform(get("/api/v1/acknowledge")
                        .param("trackingId", inqId)
                        .param("confirm", "true"))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("Acknowledgement Sent!")));

        verify(emailService, times(1)).sendUserAcknowledgementEmail(
                eq("carol@example.com"),
                eq("Carol Inquirer"),
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
    @DisplayName("POST /api/v1/acknowledge - Should return Not Found HTML when trackingId does not exist")
    void acknowledgeSubmission_PostMethod_NotFound() throws Exception {
        mockMvc.perform(post("/api/v1/acknowledge").param("trackingId", "UNKNOWN-ID"))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("Reference Code Not Found")));

        verifyNoInteractions(emailService);
    }
}
