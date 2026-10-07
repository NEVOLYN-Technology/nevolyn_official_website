package com.nevolyn.service.mail;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class EmailMessageTest {

    @Test
    @DisplayName("EmailMessage requires to, subject, and htmlBody invariants")
    void constructor_EnforcesRequiredFields() {
        assertThatThrownBy(() -> EmailMessage.builder()
                .subject("Subject")
                .htmlBody("<p>Hello</p>")
                .build())
                .isInstanceOf(NullPointerException.class)
                .hasMessageContaining("Recipient 'to' address cannot be null");

        assertThatThrownBy(() -> EmailMessage.builder()
                .to("recipient@example.com")
                .htmlBody("<p>Hello</p>")
                .build())
                .isInstanceOf(NullPointerException.class)
                .hasMessageContaining("Email 'subject' cannot be null");

        assertThatThrownBy(() -> EmailMessage.builder()
                .to("recipient@example.com")
                .subject("Subject")
                .build())
                .isInstanceOf(NullPointerException.class)
                .hasMessageContaining("Email 'htmlBody' cannot be null");
    }

    @Test
    @DisplayName("EmailMessage preserves defensive copies of attachment binary bytes")
    void attachment_PreservesDefensiveCopies() {
        byte[] original = new byte[]{1, 2, 3, 4};
        EmailMessage message = EmailMessage.builder()
                .to("to@example.com")
                .subject("Subject")
                .htmlBody("Body")
                .attachment("test.pdf", original)
                .build();

        // Mutating original array should NOT affect message attachmentBytes
        original[0] = 99;
        assertThat(message.attachmentBytes()[0]).isEqualTo((byte) 1);

        // Mutating returned array should NOT affect internal state
        message.attachmentBytes()[0] = 88;
        assertThat(message.attachmentBytes()[0]).isEqualTo((byte) 1);
    }

    @Test
    @DisplayName("EmailMessage builder sets optional attributes cleanly")
    void builder_SetsOptionalAttributes() {
        EmailMessage message = EmailMessage.builder()
                .to("test@example.com")
                .subject("Greetings")
                .htmlBody("<h1>Hello</h1>")
                .plainTextBody("Hello")
                .replyTo("reply@example.com")
                .attachment("doc.pdf", new byte[]{10, 20})
                .build();

        assertThat(message.hasPlainText()).isTrue();
        assertThat(message.hasReplyTo()).isTrue();
        assertThat(message.hasAttachment()).isTrue();
        assertThat(message.replyTo()).isEqualTo("reply@example.com");
        assertThat(message.attachmentFilename()).isEqualTo("doc.pdf");
    }
}
