package com.nevolyn.service;

import com.nevolyn.model.ContactInquiry;
import com.nevolyn.model.JobApplication;
import com.nevolyn.repository.ContactInquiryRepository;
import com.nevolyn.repository.JobApplicationRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SubmissionServiceTest {

    @Mock
    private ContactInquiryRepository inquiryRepository;

    @Mock
    private JobApplicationRepository applicationRepository;

    @InjectMocks
    private SubmissionService submissionService;

    @Test
    @DisplayName("findByReference prioritizes inquiry repository when code starts with INQ")
    void findByReference_InquiryPrefix() {
        String code = "INQ-2026-ABCD1234";
        ContactInquiry inquiry = ContactInquiry.builder()
                .inquiryId(code)
                .name("Alice")
                .email("alice@example.com")
                .subject("Question")
                .message("Hello")
                .createdAt(LocalDateTime.now())
                .build();

        when(inquiryRepository.findByInquiryId(code)).thenReturn(Optional.of(inquiry));

        Optional<SubmissionDetails> result = submissionService.findByReference(code);

        assertThat(result).isPresent();
        assertThat(result.get().referenceCode()).isEqualTo(code);
        assertThat(result.get().type()).isEqualTo(SubmissionType.CONTACT_INQUIRY);
        verify(inquiryRepository).findByInquiryId(code);
        verifyNoInteractions(applicationRepository);
    }

    @Test
    @DisplayName("findByReference prioritizes application repository when code starts with APP")
    void findByReference_ApplicationPrefix() {
        String code = "APP-2026-WXYZ5678";
        JobApplication app = JobApplication.builder()
                .applicationId(code)
                .name("Bob")
                .email("bob@example.com")
                .phone("1234567890")
                .address("City")
                .reason("Looking for role")
                .resumePath("/path/to/resume.pdf")
                .originalFileName("resume.pdf")
                .createdAt(LocalDateTime.now())
                .build();

        when(applicationRepository.findByApplicationId(code)).thenReturn(Optional.of(app));

        Optional<SubmissionDetails> result = submissionService.findByReference(code);

        assertThat(result).isPresent();
        assertThat(result.get().referenceCode()).isEqualTo(code);
        assertThat(result.get().type()).isEqualTo(SubmissionType.JOB_APPLICATION);
        verify(applicationRepository).findByApplicationId(code);
        verifyNoInteractions(inquiryRepository);
    }

    @Test
    @DisplayName("markAcknowledged delegates to repository and returns true on first update")
    void markAcknowledged_FirstTime_ReturnsTrue() {
        String code = "INQ-2026-ABCD1234";
        SubmissionDetails details = new SubmissionDetails(
                SubmissionType.CONTACT_INQUIRY,
                code,
                "Alice",
                "alice@example.com",
                "Subject",
                "Msg",
                null, null, null, null, null,
                LocalDateTime.now(),
                false
        );

        when(inquiryRepository.markAcknowledged(eq(code), any())).thenReturn(1);

        boolean acknowledged = submissionService.markAcknowledged(details);

        assertThat(acknowledged).isTrue();
        verify(inquiryRepository).markAcknowledged(eq(code), any());
    }

    @Test
    @DisplayName("markAcknowledged returns false if already acknowledged in DB")
    void markAcknowledged_AlreadyDone_ReturnsFalse() {
        String code = "INQ-2026-ABCD1234";
        SubmissionDetails details = new SubmissionDetails(
                SubmissionType.CONTACT_INQUIRY,
                code,
                "Alice",
                "alice@example.com",
                "Subject",
                "Msg",
                null, null, null, null, null,
                LocalDateTime.now(),
                true
        );

        when(inquiryRepository.markAcknowledged(eq(code), any())).thenReturn(0);

        boolean acknowledged = submissionService.markAcknowledged(details);

        assertThat(acknowledged).isFalse();
        verify(inquiryRepository).markAcknowledged(eq(code), any());
    }
}
