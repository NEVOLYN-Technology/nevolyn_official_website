package com.saturn.rnd.service;

import com.saturn.rnd.exception.FileStorageException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.mock.web.MockMultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * Security-focused tests for {@link FileStorageService}.
 *
 * <p>
 * Both inputs to {@code storeFile} are attacker-controlled — the browser
 * supplies the original filename, and the base name is derived from the
 * applicant's own name field. These tests pin the two properties that matter:
 * uploads cannot escape the storage root, and only the allow-listed document
 * types are accepted.
 *
 * @author Saturn R&D Engineering
 */
class FileStorageServiceTest {

    private static final byte[] CONTENT = "resume bytes".getBytes();

    private FileStorageService serviceFor(Path root) {
        return new FileStorageService(root.toString());
    }

    private MockMultipartFile pdf() {
        return new MockMultipartFile("resume", "cv.pdf", "application/pdf", CONTENT);
    }

    @Test
    @DisplayName("Stores a valid PDF inside the configured storage root")
    void storesValidPdfInsideRoot(@TempDir Path root) {
        FileStorageService service = serviceFor(root);

        String stored = service.storeFile(pdf(), "APP-2026-0001_jane_doe");

        assertThat(Path.of(stored))
                .as("stored file stays within the storage root")
                .startsWith(root.toAbsolutePath().normalize())
                .exists();
    }

    /**
     * The base name reaches this service as {@code applicationId + "_" + name},
     * where name is raw form input. A traversal sequence there must not be able
     * to steer the write outside the upload directory.
     */
    @ParameterizedTest(name = "traversal attempt: {0}")
    @ValueSource(strings = {
            "../../../../etc/passwd",
            "..\\..\\..\\windows\\system32\\evil",
            "APP-1_../../escaped",
            "....//....//escaped",
            "/absolute/elsewhere",
            "..",
    })
    @DisplayName("Never writes outside the storage root, whatever the base name contains")
    void neverEscapesStorageRoot(String maliciousBaseName, @TempDir Path root) {
        FileStorageService service = serviceFor(root);

        String stored = service.storeFile(pdf(), maliciousBaseName);

        Path normalizedRoot = root.toAbsolutePath().normalize();
        assertThat(Path.of(stored))
                .as("sanitized path must remain confined to the storage root")
                .startsWith(normalizedRoot)
                .exists();

        // Nothing may appear beside the storage directory.
        assertThat(Files.exists(normalizedRoot.getParent().resolve("escaped.pdf"))).isFalse();
        assertThat(Files.exists(normalizedRoot.getParent().resolve("passwd.pdf"))).isFalse();
    }

    @ParameterizedTest(name = "rejected upload type: {0}")
    @ValueSource(strings = {"payload.exe", "script.sh", "archive.zip", "page.html", "noextension", "cv.pdf.exe"})
    @DisplayName("Rejects any file type outside the PDF/DOC/DOCX allow-list")
    void rejectsDisallowedExtensions(String filename, @TempDir Path root) {
        FileStorageService service = serviceFor(root);
        MockMultipartFile file = new MockMultipartFile("resume", filename, "application/octet-stream", CONTENT);

        assertThatThrownBy(() -> service.storeFile(file, "APP-2026-0002_applicant"))
                .isInstanceOf(FileStorageException.class)
                .hasMessageContaining("Only PDF, DOC, and DOCX");
    }

    @ParameterizedTest(name = "accepted upload type: {0}")
    @ValueSource(strings = {"cv.pdf", "cv.PDF", "cv.doc", "cv.docx", "cv.DOCX"})
    @DisplayName("Accepts the allow-listed document types regardless of case")
    void acceptsAllowedExtensions(String filename, @TempDir Path root) {
        FileStorageService service = serviceFor(root);
        MockMultipartFile file = new MockMultipartFile("resume", filename, "application/octet-stream", CONTENT);

        assertThat(service.storeFile(file, "APP-2026-0003_applicant")).isNotBlank();
    }

    @Test
    @DisplayName("Replaces path separators rather than dropping them")
    void replacesSeparatorsWithUnderscores(@TempDir Path root) {
        FileStorageService service = serviceFor(root);

        // Separators are substituted, not deleted, so the name stays distinct
        // instead of silently collapsing onto another applicant's file.
        String stored = service.storeFile(pdf(), "///\\\\");

        assertThat(Path.of(stored)).exists().hasFileName("_____.pdf");
    }

    @Test
    @DisplayName("Falls back to a safe name when sanitization empties the base name")
    void fallsBackWhenBaseNameIsEntirelyUnsafe(@TempDir Path root) {
        FileStorageService service = serviceFor(root);

        // Dots survive the character filter but are then stripped from the
        // front, leaving nothing — the service must still yield a usable name
        // rather than writing to a bare ".pdf".
        String stored = service.storeFile(pdf(), "..");

        assertThat(Path.of(stored)).exists().hasFileName("resume.pdf");
    }
}
