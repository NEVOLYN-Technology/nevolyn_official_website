package com.nevolyn.service.mail;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.Map;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class EmailTemplateRendererTest {

    private EmailTemplateRenderer renderer;

    @BeforeEach
    void setUp() {
        renderer = new EmailTemplateRenderer();
    }

    @Test
    @DisplayName("Renderer should escape dynamic HTML and script injections in user inputs")
    void escapesDangerousHtmlInjections() {
        Map<String, String> values = Map.of(
                "name", "<script>alert('XSS')</script>Alice",
                "email", "alice@example.com",
                "subject", "Inquiry <img src=x onerror=alert(1)>",
                "message", "Hello & welcome",
                "referenceCode", "INQ-2026-0001",
                "submittedAt", "2026-10-07 12:00:00",
                "acknowledgeUrl", "https://api.nevolyn.com/api/v1/acknowledge?trackingId=INQ-2026-0001"
        );

        String rendered = renderer.render("templates/email/contact-admin-notification-mail.html", values);

        assertThat(rendered)
                .doesNotContain("<script>alert('XSS')</script>")
                .contains("&lt;script&gt;alert(&#39;XSS&#39;)&lt;/script&gt;Alice")
                .doesNotContain("<img src=x onerror=alert(1)>")
                .contains("&lt;img src=x onerror=alert(1)&gt;")
                .contains("INQ-2026-0001");
    }

    @Test
    @DisplayName("Renderer should allow unescaped URLs for whitelisted raw keys")
    void preservesRawKeysUnescaped() {
        String rawUrl = "https://api.nevolyn.com/api/v1/acknowledge?trackingId=INQ-2026-0001&source=email";
        Map<String, String> values = Map.of(
                "name", "Bob",
                "email", "bob@example.com",
                "subject", "Hello",
                "message", "Testing raw key",
                "referenceCode", "INQ-2026-0001",
                "submittedAt", "2026-10-07 12:00:00",
                "acknowledgeUrl", rawUrl
        );

        String rendered = renderer.render("templates/email/contact-admin-notification-mail.html", values, Set.of("acknowledgeUrl"));

        assertThat(rendered).contains("href=\"" + rawUrl + "\"");
    }

    @Test
    @DisplayName("Plain-text generator should strip styles, scripts, and comments while formatting blocks")
    void generatePlainText_FormatsCleanly() {
        String sampleHtml = """
                <!-- This is a comment -->
                <style>body { font-size: 14px; }</style>
                <h1>Welcome to NEVOLYN</h1>
                <p>First paragraph with <strong>bold</strong> text.</p>
                <div>Line in a div.<br>New line from break.</div>
                """;

        String plainText = renderer.generatePlainText(sampleHtml);

        assertThat(plainText)
                .doesNotContain("<!-- This is a comment -->")
                .doesNotContain("font-size: 14px")
                .contains("Welcome to NEVOLYN")
                .contains("First paragraph with bold text.")
                .contains("Line in a div.")
                .contains("New line from break.");
    }

    @Test
    @DisplayName("Renderer throws IllegalStateException when template is missing from classpath")
    void throwsWhenTemplateNotFound() {
        assertThatThrownBy(() -> renderer.render("templates/email/non-existent-template.html", Map.of()))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Email template missing from classpath");
    }
}
