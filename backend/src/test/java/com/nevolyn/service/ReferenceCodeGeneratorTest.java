package com.nevolyn.service;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.HashSet;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

class ReferenceCodeGeneratorTest {

    private final ReferenceCodeGenerator generator = new ReferenceCodeGenerator();

    @Test
    @DisplayName("Generated code follows <PREFIX>-<YEAR>-<8CHARS> format")
    void testCodeFormat() {
        String code = generator.generate(SubmissionType.CONTACT_INQUIRY);
        assertThat(code).matches("^INQ-\\d{4}-[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{8}$");

        String appCode = generator.generate(SubmissionType.JOB_APPLICATION);
        assertThat(appCode).matches("^APP-\\d{4}-[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{8}$");
    }

    @Test
    @DisplayName("Generated codes are collision-free across multiple invocations")
    void testUniqueness() {
        Set<String> generated = new HashSet<>();
        int count = 1000;
        for (int i = 0; i < count; i++) {
            String code = generator.generate(SubmissionType.CONTACT_INQUIRY);
            generated.add(code);
        }
        assertThat(generated).hasSize(count);
    }
}
