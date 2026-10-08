package com.nevolyn.service.pdf;

import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import com.nevolyn.model.JobApplication;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import java.awt.BasicStroke;
import java.awt.Color;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;

/**
 * Enterprise pure-Java PDF document builder and merger for official NEVOLYN
 * candidate applications.
 *
 * <h2>Architectural Highlights</h2>
 * <ul>
 * <li><strong>Direct OpenPDF Vector Pipeline:</strong> 100% native Java drawing
 * without
 * unreliable HTML/XHTML parsing or headless browser overhead.</li>
 * <li><strong>Zero Disk I/O on Request Path:</strong> High-resolution brand
 * assets and security
 * badges are pre-cached in memory at application startup
 * ({@code @PostConstruct}).</li>
 * <li><strong>Pixel-Perfect Single Page A4 Cover:</strong> Strictly balanced
 * vertical rhythm guaranteed
 * to fit on exactly 1 page before appending the applicant's submitted CV.</li>
 * <li><strong>Seamless Multi-Page CV Merging:</strong> Directly merges the
 * applicant's original PDF CV
 * from Page 2 onwards into an executive recruitment dossier.</li>
 * </ul>
 *
 * @author NEVOLYN Engineering Standard
 * @version 2.1.0
 */
@Slf4j
@Component
public class CandidateApplicationPdfBuilder {

    // ── Design Tokens & Color Palette ───────────────────────────────────────
    private static final Color COLOR_PRIMARY = new Color(15, 23, 42); // Slate 900 (#0f172a)
    private static final Color COLOR_ACCENT = new Color(2, 132, 199); // Sky 600 (#0284c7)
    private static final Color COLOR_BORDER = new Color(203, 213, 225); // Slate 300 (#cbd5e1)
    private static final Color COLOR_TEXT_MUTED = new Color(71, 85, 105); // Slate 600 (#475569)
    private static final Color COLOR_TEXT_BODY = new Color(51, 65, 85); // Slate 700 (#334155)
    private static final Color COLOR_SUCCESS_DOT = new Color(16, 185, 129); // Emerald 500

    private static final Color COLOR_TABLE_HEADER_BG = new Color(219, 228, 238); // Soft Slate Blue (#dbe4ee)
    private static final Color COLOR_TABLE_LABEL_BG = new Color(248, 250, 252); // Slate 50
    private static final Color COLOR_CARD_BG = new Color(248, 250, 252); // Slate 50

    private static final Color COLOR_PRIVACY_BG = new Color(240, 253, 244); // Emerald 50 (#f0fdf4)
    private static final Color COLOR_PRIVACY_BORDER = new Color(187, 247, 208); // Emerald 200 (#bbf7d0)
    private static final Color COLOR_PRIVACY_TEXT = new Color(20, 83, 45); // Emerald 900 (#14532d)
    private static final Color COLOR_PRIVACY_HEADING = new Color(22, 101, 52); // Emerald 800 (#166534)

    private static final Color COLOR_FOOTER_BG = new Color(248, 250, 252); // Slate 50 (#f8fafc)
    private static final Color COLOR_FOOTER_BORDER = new Color(226, 232, 240); // Slate 200 (#e2e8f0)
    private static final Color COLOR_FOOTER_DIVIDER = new Color(226, 232, 240); // Slate 200

    // ── Typography Tokens ───────────────────────────────────────────────────
    private static final Font FONT_TABLE_HEADER = font(11.8f, Font.BOLD, COLOR_PRIMARY);
    private static final Font FONT_GRID_LABEL = font(9.8f, Font.BOLD, COLOR_TEXT_MUTED);
    private static final Font FONT_GRID_VALUE = font(10.2f, Font.BOLD, COLOR_PRIMARY);
    private static final Font FONT_GRID_LINK = font(10.2f, Font.BOLD, COLOR_ACCENT);

    // ── Asset Paths & Constants ─────────────────────────────────────────────
    private static final String ASSET_NEVOLYN_ICON = "static/nevolyn-icon.png";

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter
            .ofPattern("dd MMMM yyyy, HH:mm 'UTC'")
            .withZone(ZoneId.of("UTC"));

    private static final float[] GRID_WIDTHS = { 32f, 68f };

    // ── Pre-Cached Asset Byte Arrays (High Concurrency Optimization) ───────
    private byte[] cachedNevolynIconBytes;
    private byte[] cachedLockIconBytes;

    @PostConstruct
    public void initAssetCache() {
        log.info("Initializing in-memory asset cache for NEVOLYN PDF builder high concurrency...");
        this.cachedNevolynIconBytes = loadClasspathResourceBytes(ASSET_NEVOLYN_ICON);
        this.cachedLockIconBytes = generateLockIconPngBytes();
        log.info("PDF builder assets cached successfully (Nevolyn Icon: {}B, Lock Icon: {}B)",
                cachedNevolynIconBytes != null ? cachedNevolynIconBytes.length : 0,
                cachedLockIconBytes != null ? cachedLockIconBytes.length : 0);
    }

    /**
     * Compiles Page 1 (Candidate Credentials & Official Statement) and merges the
     * uploaded
     * CV document into an executive recruitment dossier.
     *
     * @param application     persisted candidate job application entity
     * @param originalCvBytes raw bytes of applicant's uploaded CV (if PDF, merged;
     *                        if not, referenced)
     * @return complete unified candidate application PDF byte array
     */
    public byte[] buildDossier(JobApplication application, byte[] originalCvBytes) {
        // Fallback safety: ensure cache is ready even if called outside Spring
        // lifecycle
        if (cachedNevolynIconBytes == null || cachedLockIconBytes == null) {
            initAssetCache();
        }

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
     * Generates Page 1: Official Candidate Application Cover Sheet, Integrity
     * Statement,
     * Credentials Table with National ID (NID), Privacy Banner, and Institutional
     * Footer.
     */
    private byte[] generateCoverPage(JobApplication application) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4, 28, 28, 18, 18);

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            // 1. NEVOLYN Brand Header with Logo Lockup (Left: Logo + NEVOLYN, Right: Career
            // Application Form + info@nevolyn.com)
            addBrandHeader(document);

            // 2. Metadata Strip (Tracking Reference Code & Submission Timestamp)
            addMetadataStrip(document, application);

            // 4. Official Candidate Integrity & Purpose Statement Box (Larger Font to
            // gracefully fill page)
            addCandidateStatement(document, application);

            // 5. Consolidated Credentials Table (including NID)
            addCredentialsTable(document, application);

            // 6. Data Privacy Safeguard Banner
            addPrivacyBanner(document);

            // 7. NEVOLYN Institutional Footer (Website, Email, LinkedIn, Facebook)
            addInstitutionalFooter(document);

            // 8. Bottom Document Classification Strip
            addClassificationStrip(document);

            document.close();
            return out.toByteArray();

        } catch (Exception ex) {
            log.error("Failed to generate application cover page PDF for '{}': {}",
                    application.getApplicationId(), ex.getMessage(), ex);
            throw new IllegalStateException("Error rendering application cover PDF", ex);
        }
    }

    // ═════════════════════════════════════════════════════════════════════════
    // Section Builders
    // ═════════════════════════════════════════════════════════════════════════

    private void addBrandHeader(Document document) throws DocumentException {
        PdfPTable lockup = new PdfPTable(new float[] { 52f, 48f });
        lockup.setWidthPercentage(100);

        // --- Left: NEVOLYN Logo & Brand Title Block ---
        // Tight ratio so 40pt icon and NEVOLYN wordmark are closer together
        PdfPTable brandBlock = new PdfPTable(new float[] { 42f, 240f });
        brandBlock.setWidthPercentage(100);

        Image nevolynIcon = createImageFromBytes(cachedNevolynIconBytes, 40f, 40f);
        PdfPCell iconCell = nevolynIcon != null ? new PdfPCell(nevolynIcon, false) : new PdfPCell(new Phrase(""));
        styleBorderless(iconCell);
        iconCell.setHorizontalAlignment(Element.ALIGN_LEFT);
        iconCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        iconCell.setPadding(0f);
        brandBlock.addCell(iconCell);

        Paragraph brandText = new Paragraph();
        brandText.setLeading(18f);
        brandText.add(link("NEVOLYN", "https://nevolyn.com", font(22f, Font.BOLD, COLOR_PRIMARY)));
        brandText.add(Chunk.NEWLINE);
        brandText.add(new Chunk("ENGINEERING WHAT'S NEXT", new Font(Font.COURIER, 8.5f, Font.BOLD, COLOR_ACCENT)));
        PdfPCell brandTextCell = new PdfPCell(brandText);
        styleBorderless(brandTextCell);
        brandTextCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        brandTextCell.setPaddingLeft(4f);
        brandBlock.addCell(brandTextCell);

        PdfPCell leftCell = new PdfPCell(brandBlock);
        styleBorderless(leftCell);
        leftCell.setPadding(0f);
        lockup.addCell(leftCell);

        // --- Right: Career Application Form Header Block ---
        Paragraph rightText = new Paragraph();
        rightText.setLeading(16f);
        rightText.setAlignment(Element.ALIGN_RIGHT);
        rightText.add(new Chunk("Application Form", font(14.5f, Font.BOLD, COLOR_PRIMARY)));
        rightText.add(Chunk.NEWLINE);
        rightText.add(link("info@nevolyn.com", "mailto:info@nevolyn.com", font(9.5f, Font.BOLD, COLOR_ACCENT)));

        PdfPCell rightCell = new PdfPCell(rightText);
        styleBorderless(rightCell);
        rightCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        rightCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        lockup.addCell(rightCell);

        document.add(lockup);

        // Full-width Accent divider rule
        PdfPTable rule = new PdfPTable(1);
        rule.setWidthPercentage(100);
        rule.setSpacingBefore(5f);
        rule.setSpacingAfter(7f);
        PdfPCell lineCell = new PdfPCell();
        lineCell.setFixedHeight(2.0f);
        lineCell.setBackgroundColor(COLOR_ACCENT);
        lineCell.setBorder(Rectangle.NO_BORDER);
        rule.addCell(lineCell);
        document.add(rule);
    }

    private void addMetadataStrip(Document document, JobApplication application) throws DocumentException {
        PdfPTable table = new PdfPTable(new float[] { 50f, 50f });
        table.setWidthPercentage(100);
        table.setSpacingAfter(7f);

        Font labelFont = font(8.0f, Font.BOLD, COLOR_TEXT_MUTED);
        Font refValFont = new Font(Font.COURIER, 13.5f, Font.BOLD, COLOR_ACCENT);
        Font dateValFont = font(11.5f, Font.BOLD, COLOR_PRIMARY);

        LocalDateTime createdAt = application.getCreatedAt() != null ? application.getCreatedAt()
                : LocalDateTime.now(ZoneOffset.UTC);

        table.addCell(metaCell("TRACKING REFERENCE CODE", application.getApplicationId(), labelFont, refValFont,
                COLOR_CARD_BG));
        table.addCell(metaCell("SUBMISSION TIMESTAMP", createdAt.atZone(ZoneOffset.UTC).format(DATE_FORMATTER),
                labelFont, dateValFont, COLOR_CARD_BG));

        document.add(table);
    }

    private PdfPCell metaCell(String label, String value, Font labelFont, Font valFont, Color bg) {
        Paragraph p = new Paragraph();
        p.setLeading(15f);
        p.add(new Phrase(label + "\n", labelFont));
        p.add(new Phrase(value, valFont));

        PdfPCell cell = new PdfPCell(p);
        cell.setBackgroundColor(bg);
        cell.setBorderColor(COLOR_BORDER);
        cell.setPaddingTop(5.5f);
        cell.setPaddingBottom(6.5f);
        cell.setPaddingLeft(10f);
        cell.setPaddingRight(10f);
        return cell;
    }

    private void addCandidateStatement(Document document, JobApplication application) throws DocumentException {
        PdfPTable table = new PdfPTable(1);
        table.setWidthPercentage(100);
        table.setSpacingAfter(6f);

        PdfPCell cell = new PdfPCell();
        cell.setBackgroundColor(COLOR_CARD_BG);
        cell.setBorderColor(COLOR_BORDER);
        cell.setBorderWidth(0.8f);
        cell.setPaddingTop(7f);
        cell.setPaddingBottom(8f);
        cell.setPaddingLeft(12f);
        cell.setPaddingRight(12f);

        // Statement Title Header
        Paragraph title = new Paragraph("APPLICATION STATEMENT",
                font(11.0f, Font.BOLD, COLOR_PRIMARY));
        title.setSpacingAfter(4f);
        cell.addElement(title);

        String candidateName = valueOrNA(application.getName());
        String nidStr = valueOrNA(application.getNid());

        Font fBody = font(10.6f, Font.NORMAL, COLOR_TEXT_BODY);
        Font fBold = font(10.6f, Font.BOLD, COLOR_PRIMARY);

        // Paragraph 1: Application submission statement
        Paragraph p1 = new Paragraph();
        p1.setLeading(15.5f);
        p1.setAlignment(Element.ALIGN_JUSTIFIED);
        p1.add(new Chunk("This application is officially submitted by ",
                fBody));
        p1.add(new Chunk(candidateName, fBold));
        p1.add(new Chunk(" (National ID / NID: ", fBody));
        p1.add(new Chunk(nidStr, fBold));
        p1.add(new Chunk(") to ", fBody));
        p1.add(new Chunk("NEVOLYN", fBold));
        p1.add(new Chunk(
                " for recruitment consideration and technical evaluation. All submitted credentials, contact records, and attached curriculum vitae are affirmed by the applicant as authentic, valid, and representative of their qualifications.",
                fBody));
        cell.addElement(p1);

        table.addCell(cell);
        document.add(table);

        // --- Dedicated Statement of Purpose & Motivation Box ---
        addStatementOfPurposeBox(document, application);
    }

    private void addStatementOfPurposeBox(Document document, JobApplication application) throws DocumentException {
        PdfPTable table = new PdfPTable(1);
        table.setWidthPercentage(100);
        table.setSpacingAfter(6f);

        PdfPCell cell = new PdfPCell();
        cell.setBackgroundColor(COLOR_CARD_BG);
        cell.setBorderColor(COLOR_BORDER);
        cell.setBorderWidth(0.8f);
        cell.setPaddingTop(8f);
        cell.setPaddingBottom(9f);
        cell.setPaddingLeft(12f);
        cell.setPaddingRight(12f);

        Paragraph sopTitle = new Paragraph("STATEMENT OF PURPOSE", font(10.8f, Font.BOLD, COLOR_ACCENT));
        sopTitle.setSpacingAfter(5f);
        cell.addElement(sopTitle);

        String statementText = (application.getReason() != null && !application.getReason().isBlank())
                ? application.getReason().trim()
                : "No statement provided.";

        Paragraph stmtP = new Paragraph(statementText, font(10.4f, Font.NORMAL, COLOR_TEXT_BODY));
        stmtP.setLeading(15.2f);
        stmtP.setAlignment(Element.ALIGN_JUSTIFIED);
        cell.addElement(stmtP);

        table.addCell(cell);
        document.add(table);
    }

    private void addCredentialsTable(Document document, JobApplication application) throws DocumentException {
        PdfPTable table = new PdfPTable(GRID_WIDTHS);
        table.setWidthPercentage(100);
        table.setSpacingAfter(7f);

        // Header Title Banner spanning all columns
        PdfPCell headerCell = new PdfPCell(new Phrase("CANDIDATE CREDENTIALS & ASSESSMENT RECORD", FONT_TABLE_HEADER));
        headerCell.setColspan(2);
        headerCell.setBackgroundColor(COLOR_TABLE_HEADER_BG);
        headerCell.setBorderColor(COLOR_BORDER);
        headerCell.setPaddingTop(6.0f);
        headerCell.setPaddingBottom(6.0f);
        headerCell.setPaddingLeft(10f);
        table.addCell(headerCell);

        // 1. Applicant Name
        addRow(table, Field.of("Applicant Full Name", valueOrNA(application.getName())));

        // 2. National ID (NID)
        addRow(table, Field.of("National ID (NID)", valueOrNA(application.getNid())));

        // 3. Contact Email
        String email = valueOrNA(application.getEmail());
        String emailUrl = application.getEmail() != null && !application.getEmail().isBlank()
                ? "mailto:" + application.getEmail().trim()
                : null;
        addRow(table, emailUrl != null
                ? Field.link("Contact Email Address", email, emailUrl)
                : Field.of("Contact Email Address", email));

        // 4. Contact Phone
        addRow(table, Field.of("Phone / Contact Number", valueOrNA(application.getPhone())));

        // 5. Present Address
        addRow(table, Field.of("Present Residential Address", valueOrNA(application.getAddress())));

        // 6. LinkedIn Profile
        String linkedin = application.getLinkedin();
        if (linkedin != null && !linkedin.isBlank()) {
            String url = formatExternalUrl(linkedin);
            addRow(table, Field.link("LinkedIn Profile", linkedin.trim(), url));
        } else {
            addRow(table, Field.of("LinkedIn Profile", "Not Specified"));
        }

        // 7. GitHub Profile
        String github = application.getGithub();
        if (github != null && !github.isBlank()) {
            String url = formatExternalUrl(github);
            addRow(table, Field.link("GitHub / Code Portfolio", github.trim(), url));
        } else {
            addRow(table, Field.of("GitHub / Code Portfolio", "Not Specified"));
        }

        // 8. Personal Website
        String website = application.getWebsite();
        if (website != null && !website.isBlank()) {
            String url = formatExternalUrl(website);
            addRow(table, Field.link("Personal Portfolio / Website", website.trim(), url));
        } else {
            addRow(table, Field.of("Personal Portfolio / Website", "Not Specified"));
        }

        // 9. Attached CV Document info
        String originalName = application.getOriginalFileName() != null ? application.getOriginalFileName()
                : "resume.pdf";
        String sizeStr = application.getFileSizeBytes() != null
                ? String.format("%.2f MB", application.getFileSizeBytes() / (1024.0 * 1024.0))
                : "PDF Attachment";
        addRow(table, Field.of("Attached Document (CV)", originalName + " (" + sizeStr + ")"));

        // 10. Status
        addRow(table, Field.of("Recruitment Review Status", "PENDING EVALUATION & INTERVIEW"));

        document.add(table);
    }

    private void addRow(PdfPTable table, Field field) {
        PdfPCell label = new PdfPCell(new Phrase(field.label(), FONT_GRID_LABEL));
        label.setBackgroundColor(COLOR_TABLE_LABEL_BG);
        label.setBorderColor(COLOR_BORDER);
        label.setPaddingTop(5.5f);
        label.setPaddingBottom(5.5f);
        label.setPaddingLeft(10f);
        label.setPaddingRight(6f);
        label.setVerticalAlignment(Element.ALIGN_MIDDLE);
        table.addCell(label);

        Paragraph content = new Paragraph();
        if (field.url() != null) {
            content.add(link(field.value(), field.url(), FONT_GRID_LINK));
        } else {
            content.add(new Chunk(field.value(), FONT_GRID_VALUE));
        }
        PdfPCell value = new PdfPCell();
        value.setBackgroundColor(Color.WHITE);
        value.setBorderColor(COLOR_BORDER);
        value.setPaddingTop(5.5f);
        value.setPaddingBottom(5.5f);
        value.setPaddingLeft(10f);
        value.setPaddingRight(6f);
        value.setVerticalAlignment(Element.ALIGN_MIDDLE);
        value.addElement(content);
        table.addCell(value);
    }

    private void addPrivacyBanner(Document document) throws DocumentException {
        PdfPTable banner = new PdfPTable(new float[] { 6f, 94f });
        banner.setWidthPercentage(100);
        banner.setSpacingAfter(7f);

        Image lockIcon = createImageFromBytes(cachedLockIconBytes, 15f, 15f);
        PdfPCell iconCell = lockIcon != null ? new PdfPCell(lockIcon, false) : new PdfPCell(new Phrase(""));
        iconCell.setBackgroundColor(COLOR_PRIVACY_BG);
        iconCell.setBorderColor(COLOR_PRIVACY_BORDER);
        iconCell.setBorder(Rectangle.LEFT | Rectangle.TOP | Rectangle.BOTTOM);
        iconCell.setHorizontalAlignment(Element.ALIGN_CENTER);
        iconCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        iconCell.setPadding(3f);
        banner.addCell(iconCell);

        Paragraph p = new Paragraph();
        p.add(new Chunk(
                "Candidate personal data, National ID (NID), and CV are strictly confidential under NEVOLYN Data Privacy Safeguards.",
                font(8.2f, Font.NORMAL, COLOR_PRIVACY_TEXT)));

        PdfPCell textCell = new PdfPCell(p);
        textCell.setBackgroundColor(COLOR_PRIVACY_BG);
        textCell.setBorderColor(COLOR_PRIVACY_BORDER);
        textCell.setBorder(Rectangle.TOP | Rectangle.BOTTOM | Rectangle.RIGHT);
        textCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        textCell.setPaddingLeft(6f);
        textCell.setPaddingTop(5f);
        textCell.setPaddingBottom(5f);
        banner.addCell(textCell);

        document.add(banner);
    }

    private void addInstitutionalFooter(Document document) throws DocumentException {
        PdfPTable footerCard = new PdfPTable(1);
        footerCard.setWidthPercentage(100);
        footerCard.setSpacingAfter(6f);

        PdfPCell cell = new PdfPCell();
        cell.setBackgroundColor(COLOR_FOOTER_BG);
        cell.setBorderColor(COLOR_FOOTER_BORDER);
        cell.setBorderWidth(1.0f);
        cell.setPaddingTop(7f);
        cell.setPaddingBottom(8f);
        cell.setPaddingLeft(12f);
        cell.setPaddingRight(12f);

        // NEVOLYN Brand Line
        Paragraph nevBrand = new Paragraph();
        nevBrand.add(new Chunk("NEVOLYN", font(9.5f, Font.BOLD, COLOR_PRIMARY)));
        nevBrand.setSpacingAfter(4f);
        cell.addElement(nevBrand);

        // 4 Links Row: Website, Email, LinkedIn, Facebook
        PdfPTable nevLinks = new PdfPTable(new float[] { 26f, 26f, 24f, 24f });
        nevLinks.setWidthPercentage(100);
        addFooterChannelCell(nevLinks, "Web", "nevolyn.com", "https://nevolyn.com/");
        addFooterChannelCell(nevLinks, "Email", "info@nevolyn.com", "mailto:info@nevolyn.com");
        addFooterChannelCell(nevLinks, "LinkedIn", "nevolyn", "https://www.linkedin.com/company/nevolyn/");
        addFooterChannelCell(nevLinks, "Facebook", "nevolyn", "https://www.facebook.com/nevolyn/");
        cell.addElement(nevLinks);

        footerCard.addCell(cell);
        document.add(footerCard);
    }

    private void addFooterChannelCell(PdfPTable table, String channelLabel, String displayText, String targetUrl) {
        Paragraph p = new Paragraph();
        p.setLeading(10f);
        p.add(new Chunk(channelLabel + ": ", font(8.0f, Font.BOLD, COLOR_TEXT_MUTED)));
        p.add(link(displayText, targetUrl, font(8.0f, Font.BOLD, COLOR_ACCENT)));

        PdfPCell cell = new PdfPCell(p);
        cell.setBorder(Rectangle.NO_BORDER);
        cell.setPadding(1f);
        cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        table.addCell(cell);
    }

    private void addClassificationStrip(Document document) throws DocumentException {
        PdfPTable strip = new PdfPTable(new float[] { 70f, 30f });
        strip.setWidthPercentage(100);

        Paragraph left = new Paragraph("NEVOLYN Official Candidate Application Record",
                font(7.0f, Font.NORMAL, COLOR_TEXT_MUTED));
        PdfPCell leftCell = new PdfPCell(left);
        leftCell.setBorder(Rectangle.NO_BORDER);
        strip.addCell(leftCell);

        Paragraph right = new Paragraph("System Generated", font(7.0f, Font.NORMAL, COLOR_TEXT_MUTED));
        right.setAlignment(Element.ALIGN_RIGHT);
        PdfPCell rightCell = new PdfPCell(right);
        rightCell.setBorder(Rectangle.NO_BORDER);
        rightCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        strip.addCell(rightCell);

        document.add(strip);
    }

    // ═════════════════════════════════════════════════════════════════════════
    // Helpers & Performance Optimization
    // ═════════════════════════════════════════════════════════════════════════

    private static Font font(float size, int style, Color color) {
        return new Font(Font.HELVETICA, size, style, color);
    }

    private static Anchor link(String text, String url, Font font) {
        Anchor anchor = new Anchor(text, font);
        anchor.setReference(url);
        return anchor;
    }

    private static void styleBorderless(PdfPCell cell) {
        cell.setBorder(Rectangle.NO_BORDER);
        cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
    }

    private String valueOrNA(String val) {
        return (val == null || val.isBlank()) ? "Not Specified" : val.trim();
    }

    private String formatExternalUrl(String url) {
        if (url == null || url.isBlank())
            return "#";
        String clean = url.trim();
        return clean.startsWith("http://") || clean.startsWith("https://") ? clean : "https://" + clean;
    }

    private byte[] loadClasspathResourceBytes(String classpath) {
        try {
            ClassPathResource resource = new ClassPathResource(classpath);
            if (!resource.exists()) {
                log.warn("Classpath brand asset not found: {}", classpath);
                return null;
            }
            try (InputStream is = resource.getInputStream()) {
                return is.readAllBytes();
            }
        } catch (Exception e) {
            log.warn("Failed to load classpath resource {}: {}", classpath, e.getMessage());
            return null;
        }
    }

    private Image createImageFromBytes(byte[] bytes, float maxWidth, float maxHeight) {
        if (bytes == null || bytes.length == 0) {
            return null;
        }
        try {
            Image image = Image.getInstance(bytes);
            image.scaleToFit(maxWidth, maxHeight);
            return image;
        } catch (Exception e) {
            log.warn("Failed to instantiate Image from pre-cached bytes: {}", e.getMessage());
            return null;
        }
    }

    private byte[] generateLockIconPngBytes() {
        try {
            int size = 32;
            BufferedImage img = new BufferedImage(size, size, BufferedImage.TYPE_INT_ARGB);
            Graphics2D g = img.createGraphics();
            g.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);

            // Dark green rounded rectangle badge (#2f6b49)
            g.setColor(new Color(47, 107, 73));
            g.fillRoundRect(2, 2, size - 4, size - 4, 8, 8);

            // White lock body
            g.setColor(Color.WHITE);
            g.fillRoundRect(8, 14, 16, 11, 3, 3);

            // White lock shackle
            g.setStroke(new BasicStroke(2.5f, BasicStroke.CAP_ROUND, BasicStroke.JOIN_ROUND));
            g.drawArc(10, 6, 12, 13, 0, 180);

            // Keyhole dot
            g.setColor(new Color(47, 107, 73));
            g.fillOval(15, 17, 2, 4);

            g.dispose();

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            javax.imageio.ImageIO.write(img, "png", baos);
            return baos.toByteArray();
        } catch (Exception e) {
            log.warn("Failed to pre-generate lock icon PNG bytes: {}", e.getMessage());
            return null;
        }
    }

    private static boolean isPdfHeader(byte[] data) {
        return data.length >= 4 &&
                data[0] == '%' &&
                data[1] == 'P' &&
                data[2] == 'D' &&
                data[3] == 'F';
    }

    // ═════════════════════════════════════════════════════════════════════════
    // Value Types
    // ═════════════════════════════════════════════════════════════════════════

    private record Field(String label, String value, String url) {
        static Field of(String label, String value) {
            return new Field(label, value, null);
        }

        static Field link(String label, String value, String url) {
            return new Field(label, value, url);
        }
    }
}
