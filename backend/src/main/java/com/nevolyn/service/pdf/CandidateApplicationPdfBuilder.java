package com.nevolyn.service.pdf;

import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import com.nevolyn.model.JobApplication;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.awt.Color;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;

/**
 * Enterprise pure-Java PDF document builder and merger for official NEVOLYN
 * candidate applications.
 *
 * <p>
 * Generates Page 1 as an executive candidate credentials dossier &amp;
 * statement cover page,
 * and seamlessly merges the applicant's submitted CV document (from Page 2
 * onwards).
 *
 * @author NEVOLYN
 * @version 1.0.0
 */
@Slf4j
@Component
public class CandidateApplicationPdfBuilder {

    // Design Tokens & Colors
    private static final Color COLOR_PRIMARY = new Color(15, 23, 42); // Slate 900
    private static final Color COLOR_ACCENT = new Color(2, 132, 199); // Sky 600
    private static final Color COLOR_BORDER = new Color(226, 232, 240); // Slate 200
    private static final Color COLOR_TEXT_MUTED = new Color(100, 116, 139); // Slate 500
    private static final Color COLOR_TEXT_BODY = new Color(51, 65, 85); // Slate 700
    private static final Color COLOR_CARD_BG = new Color(248, 250, 252); // Slate 50
    private static final Color COLOR_HEADER_BG = new Color(241, 245, 249); // Slate 100
    private static final Color COLOR_BADGE_BG = new Color(224, 242, 254); // Sky 100
    private static final Color COLOR_BADGE_TEXT = new Color(3, 105, 161); // Sky 700

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd MMMM yyyy, HH:mm 'UTC'");

    /**
     * Compiles Page 1 (Candidate Credentials & Statement) and merges the uploaded
     * CV document.
     *
     * @param application     persisted candidate job application entity
     * @param originalCvBytes raw bytes of applicant's uploaded CV (if PDF, merged;
     *                        if not, referenced)
     * @return complete unified candidate application PDF byte array
     */
    public byte[] buildDossier(JobApplication application, byte[] originalCvBytes) {
        byte[] coverPageBytes = generateCoverPage(application);

        // If no CV bytes provided or not a PDF, return cover page
        if (originalCvBytes == null || originalCvBytes.length < 4 || !isPdfHeader(originalCvBytes)) {
            log.info("Uploaded resume is not a PDF (or empty); returning cover page for '{}'",
                    application.getApplicationId());
            return coverPageBytes;
        }

        // Merge Page 1 (Cover Credentials) with uploaded PDF resume (Page 2+)
        try (ByteArrayOutputStream mergedOut = new ByteArrayOutputStream()) {
            Document document = new Document();
            PdfCopy copy = new PdfCopy(document, mergedOut);
            document.open();

            // 1. Add Page 1 (Cover Page)
            PdfReader coverReader = new PdfReader(coverPageBytes);
            int coverPages = coverReader.getNumberOfPages();
            for (int i = 1; i <= coverPages; i++) {
                copy.addPage(copy.getImportedPage(coverReader, i));
            }
            coverReader.close();

            // 2. Append original CV pages
            PdfReader cvReader = new PdfReader(new ByteArrayInputStream(originalCvBytes));
            int cvPages = cvReader.getNumberOfPages();
            for (int i = 1; i <= cvPages; i++) {
                copy.addPage(copy.getImportedPage(cvReader, i));
            }
            cvReader.close();

            document.close();
            log.info("Successfully merged cover dossier (1 page) and candidate CV ({} pages) for '{}'",
                    cvPages, application.getApplicationId());
            return mergedOut.toByteArray();

        } catch (Exception ex) {
            log.error("Failed to merge PDF resume for '{}'; falling back to cover page: {}",
                    application.getApplicationId(), ex.getMessage(), ex);
            return coverPageBytes;
        }
    }

    /**
     * Generates Page 1: Official Candidate Application Cover Sheet & Credentials
     * Statement.
     */
    private byte[] generateCoverPage(JobApplication application) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4, 36, 36, 36, 36);

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            // Title & Brand Header
            PdfPTable headerTable = new PdfPTable(2);
            headerTable.setWidthPercentage(100);
            headerTable.setWidths(new float[] { 65, 35 });
            headerTable.setSpacingAfter(14);

            PdfPCell brandCell = new PdfPCell();
            brandCell.setBorder(Rectangle.NO_BORDER);
            Paragraph brandTitle = new Paragraph("NEVOLYN TECHNOLOGY", font(16, Font.BOLD, COLOR_PRIMARY));
            Paragraph brandSubtitle = new Paragraph("CANDIDATE APPLICATION DOSSIER & PROFILE RECORD",
                    font(9, Font.BOLD, COLOR_ACCENT));
            brandCell.addElement(brandTitle);
            brandCell.addElement(brandSubtitle);
            headerTable.addCell(brandCell);

            PdfPCell metaCell = new PdfPCell();
            metaCell.setBorder(Rectangle.NO_BORDER);
            metaCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
            Paragraph refCode = new Paragraph("Ref: " + application.getApplicationId(),
                    font(10, Font.BOLD, COLOR_PRIMARY));
            refCode.setAlignment(Element.ALIGN_RIGHT);

            LocalDateTime submitTime = application.getCreatedAt() != null ? application.getCreatedAt()
                    : LocalDateTime.now(ZoneOffset.UTC);
            Paragraph dateP = new Paragraph(submitTime.format(DATE_FORMATTER), font(8, Font.NORMAL, COLOR_TEXT_MUTED));
            dateP.setAlignment(Element.ALIGN_RIGHT);

            metaCell.addElement(refCode);
            metaCell.addElement(dateP);
            headerTable.addCell(metaCell);
            document.add(headerTable);

            // Divider Bar
            PdfPTable divider = new PdfPTable(1);
            divider.setWidthPercentage(100);
            PdfPCell barCell = new PdfPCell();
            barCell.setFixedHeight(2.5f);
            barCell.setBackgroundColor(COLOR_ACCENT);
            barCell.setBorder(Rectangle.NO_BORDER);
            divider.addCell(barCell);
            divider.setSpacingAfter(14);
            document.add(divider);

            // Section 1: Candidate Given Credentials
            PdfPTable credTable = new PdfPTable(2);
            credTable.setWidthPercentage(100);
            credTable.setWidths(new float[] { 50, 50 });
            credTable.setSpacingAfter(14);

            credTable.addCell(createGridCell("APPLICANT FULL NAME", application.getName()));
            credTable.addCell(createGridCell("CONTACT EMAIL", application.getEmail()));
            credTable.addCell(createGridCell("PHONE NUMBER",
                    application.getPhone() != null ? application.getPhone() : "Not provided"));
            credTable.addCell(createGridCell("PRESENT ADDRESS",
                    application.getAddress() != null ? application.getAddress() : "Not provided"));
            document.add(credTable);

            // Section 2: Professional & Portfolio Links
            PdfPTable linksTable = new PdfPTable(3);
            linksTable.setWidthPercentage(100);
            linksTable.setWidths(new float[] { 33, 33, 34 });
            linksTable.setSpacingAfter(14);

            linksTable.addCell(createGridCell("LINKEDIN PROFILE", orDefault(application.getLinkedin(), "None")));
            linksTable.addCell(createGridCell("GITHUB PROFILE", orDefault(application.getGithub(), "None")));
            linksTable.addCell(createGridCell("PERSONAL WEBSITE", orDefault(application.getWebsite(), "None")));
            document.add(linksTable);

            // Section 3: Statement of Motivation / Purpose
            Paragraph stmtHeader = new Paragraph("STATEMENT OF PURPOSE & MOTIVATION",
                    font(10, Font.BOLD, COLOR_PRIMARY));
            stmtHeader.setSpacingAfter(4);
            document.add(stmtHeader);

            PdfPTable reasonCard = new PdfPTable(1);
            reasonCard.setWidthPercentage(100);
            reasonCard.setSpacingAfter(14);

            PdfPCell reasonCell = new PdfPCell();
            reasonCell.setBackgroundColor(COLOR_CARD_BG);
            reasonCell.setBorderColor(COLOR_BORDER);
            reasonCell.setPadding(10);
            Paragraph reasonText = new Paragraph(
                    application.getReason() != null ? application.getReason() : "No statement provided.",
                    font(9.5f, Font.NORMAL, COLOR_TEXT_BODY));
            reasonText.setLeading(14);
            reasonCell.addElement(reasonText);
            reasonCard.addCell(reasonCell);
            document.add(reasonCard);

            // Section 4: Document & Verification Metadata Card
            PdfPTable metaCard = new PdfPTable(2);
            metaCard.setWidthPercentage(100);
            metaCard.setWidths(new float[] { 55, 45 });
            metaCard.setSpacingAfter(14);

            String originalName = application.getOriginalFileName() != null ? application.getOriginalFileName()
                    : "resume.pdf";
            String sizeStr = application.getFileSizeBytes() != null
                    ? String.format("%.2f MB", application.getFileSizeBytes() / (1024.0 * 1024.0))
                    : "Standard Attachment";

            metaCard.addCell(createGridCell("ATTACHED CV / RESUME", originalName + " (" + sizeStr + ")"));
            metaCard.addCell(createGridCell("RECRUITMENT STATUS", "PENDING EVALUATION"));
            document.add(metaCard);

            // Notice Footer Bar
            PdfPTable noticeTable = new PdfPTable(1);
            noticeTable.setWidthPercentage(100);
            PdfPCell noticeCell = new PdfPCell();
            noticeCell.setBackgroundColor(COLOR_BADGE_BG);
            noticeCell.setBorderColor(COLOR_ACCENT);
            noticeCell.setPadding(8);

            Paragraph noticeP = new Paragraph(
                    "DOCUMENT NOTICE: The applicant's original submitted CV document follows directly on subsequent pages. "
                            +
                            "Official record generated by NEVOLYN Platform Engineering.",
                    font(8, Font.BOLD, COLOR_BADGE_TEXT));
            noticeP.setAlignment(Element.ALIGN_CENTER);
            noticeCell.addElement(noticeP);
            noticeTable.addCell(noticeCell);
            document.add(noticeTable);

            document.close();
            return out.toByteArray();

        } catch (Exception ex) {
            log.error("Failed to generate application cover page PDF: {}", ex.getMessage(), ex);
            throw new RuntimeException("Error rendering application cover PDF", ex);
        }
    }

    private static PdfPCell createGridCell(String label, String value) {
        PdfPCell cell = new PdfPCell();
        cell.setBackgroundColor(COLOR_CARD_BG);
        cell.setBorderColor(COLOR_BORDER);
        cell.setPadding(6);
        cell.setPaddingBottom(8);

        Paragraph labelP = new Paragraph(label, font(7.5f, Font.BOLD, COLOR_TEXT_MUTED));
        labelP.setSpacingAfter(2);
        Paragraph valP = new Paragraph(value != null && !value.isBlank() ? value : "—",
                font(9.5f, Font.BOLD, COLOR_PRIMARY));

        cell.addElement(labelP);
        cell.addElement(valP);
        return cell;
    }

    private static Font font(float size, int style, Color color) {
        Font f = FontFactory.getFont(FontFactory.HELVETICA, size, style, color);
        return f;
    }

    private static String orDefault(String val, String def) {
        return val != null && !val.isBlank() ? val : def;
    }

    private static boolean isPdfHeader(byte[] data) {
        return data.length >= 4 &&
                data[0] == '%' &&
                data[1] == 'P' &&
                data[2] == 'D' &&
                data[3] == 'F';
    }
}
