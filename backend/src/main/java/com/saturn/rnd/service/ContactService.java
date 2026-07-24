package com.saturn.rnd.service;

import com.saturn.rnd.dto.ContactRequest;
import com.saturn.rnd.dto.ContactResponse;
import com.saturn.rnd.model.ContactInquiry;
import com.saturn.rnd.repository.ContactInquiryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Year;
import java.util.Random;

/**
 * Business logic service managing visitor contact inquiry submissions.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ContactService {

    private final ContactInquiryRepository repository;
    private final Random random = new Random();

    @Transactional
    public ContactResponse processInquiry(ContactRequest request) {
        String inquiryId = String.format("INQ-%d-%04d", Year.now().getValue(), random.nextInt(10000));
        log.debug("Generating unique inquiry ID '{}' for email '{}'", inquiryId, request.getEmail());

        ContactInquiry entity = ContactInquiry.builder()
                .inquiryId(inquiryId)
                .name(request.getName())
                .email(request.getEmail())
                .subject(request.getSubject())
                .message(request.getMessage())
                .build();

        ContactInquiry savedEntity = repository.save(entity);
        log.debug("Persisted ContactInquiry entity to database with PK ID: {}", savedEntity.getId());

        return ContactResponse.builder()
                .inquiryId(inquiryId)
                .build();
    }
}
