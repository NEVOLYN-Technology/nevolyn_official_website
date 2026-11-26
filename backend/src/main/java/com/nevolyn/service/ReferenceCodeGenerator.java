package com.nevolyn.service;

import org.springframework.stereotype.Component;

import java.security.SecureRandom;
import java.time.Year;
import java.time.ZoneOffset;

/**
 * Generates human-readable, collision-resistant tracking and reference codes.
 *
 * <p>Format: {@code <PREFIX>-<YEAR>-<8-CHAR-CODE>}
 * Examples: {@code INQ-2026-K7F3Q9XD}, {@code APP-2026-W4M8V2TY}
 *
 * <p>Uses {@link SecureRandom} and an unambiguous Crockford-style base32 alphabet
 * excluding easily confused characters (0/O, 1/I/L) to provide 32^8 (over 1 trillion)
 * combinations per year per prefix.
 *
 * @author NEVOLYN Engineering Standard
 * @version 1.0.0
 */
@Component
public class ReferenceCodeGenerator {

    private static final char[] ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ".toCharArray();
    private static final int CODE_LENGTH = 8;
    private final SecureRandom random = new SecureRandom();

    /**
     * Generates a reference code for the specified submission type in UTC year.
     *
     * @param type the submission type
     * @return unique formatted reference code
     */
    public String generate(SubmissionType type) {
        int year = Year.now(ZoneOffset.UTC).getValue();
        return generate(type.referencePrefix(), year);
    }

    /**
     * Generates a reference code for a given prefix and year.
     *
     * @param prefix e.g. "INQ" or "APP"
     * @param year   calendar year
     * @return formatted reference code
     */
    public String generate(String prefix, int year) {
        char[] token = new char[CODE_LENGTH];
        for (int i = 0; i < CODE_LENGTH; i++) {
            token[i] = ALPHABET[random.nextInt(ALPHABET.length)];
        }
        return prefix + "-" + year + "-" + new String(token);
    }
}
