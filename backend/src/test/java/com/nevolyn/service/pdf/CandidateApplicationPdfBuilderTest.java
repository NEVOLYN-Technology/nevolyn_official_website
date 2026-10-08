package com.nevolyn.service.pdf;

import com.lowagie.text.Document;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfWriter;
import com.nevolyn.model.JobApplication;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;

class CandidateApplicationPdfBuilderTest {

    private final CandidateApplicationPdfBuilder builder = new CandidateApplicationPdfBuilder();

    @Test
    @DisplayName("Should generate and merge CV")
    void buildDossier_WithValidPdfResume_MergesCoverAndCv() throws Exception {
        // Create a real mini valid PDF to simulate candidate CV
        ByteArrayOutputStream cvOut = new ByteArrayOutputStream();
        Document cvDoc = new Document();
        PdfWriter.getInstance(cvDoc, cvOut);
        cvDoc.open();
        cvDoc.add(new Paragraph("This is candidate John Doe's original CV page 1"));
        cvDoc.close();
        byte[] mockCvBytes = cvOut.toByteArray();

        JobApplication application = JobApplication.builder()
                .applicationId("APP-2026-TEST1234")
                .name("John Doe")
                .email("john@example.com")
                .phone("+8801700000000")
                .address("Dhaka, Bangladesh")
                .nid("1994123456789")
                .reason("I want to pioneer AI in industrial inspection.")
                .linkedin("https://linkedin.com/in/johndoe")
                .github("https://github.com/johndoe")
                .originalFileName("johndoe_cv.pdf")
                .fileSizeBytes((long) mockCvBytes.length)
                .createdAt(LocalDateTime.now())
                .build();

        byte[] mergedPdf = builder.buildDossier(application, mockCvBytes);

        assertThat(mergedPdf).isNotNull();
        assertThat(mergedPdf.length).isGreaterThan(mockCvBytes.length);

        // Verify PDF magic bytes
        assertThat(mergedPdf[0]).isEqualTo((byte) '%');
        assertThat(mergedPdf[1]).isEqualTo((byte) 'P');
        assertThat(mergedPdf[2]).isEqualTo((byte) 'D');
        assertThat(mergedPdf[3]).isEqualTo((byte) 'F');
    }

    @Test
    @DisplayName("Should generate cover page when resume is null or non-PDF")
    void buildDossier_NonPdfResume_ReturnsCoverPage() {
        JobApplication application = JobApplication.builder()
                .applicationId("APP-2026-TEST5678")
                .name("Jane Doe")
                .email("jane@example.com")
                .phone("+8801800000000")
                .address("Chittagong, Bangladesh")
                .nid("1994123456789")
                .reason("Excited to contribute to software automation.")
                .originalFileName("janedoe_cv.docx")
                .createdAt(LocalDateTime.now())
                .build();

        byte[] resultPdf = builder.buildDossier(application, "non-pdf-docx-bytes".getBytes());

        assertThat(resultPdf).isNotNull();
        assertThat(resultPdf.length).isGreaterThan(100);
        assertThat(resultPdf[0]).isEqualTo((byte) '%');
        assertThat(resultPdf[1]).isEqualTo((byte) 'P');
        assertThat(resultPdf[2]).isEqualTo((byte) 'D');
        assertThat(resultPdf[3]).isEqualTo((byte) 'F');
    }
}
