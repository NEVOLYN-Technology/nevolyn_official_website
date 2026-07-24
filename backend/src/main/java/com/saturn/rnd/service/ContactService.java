package com.saturn.rnd.service;

import com.saturn.rnd.dto.ContactRequest;
import com.saturn.rnd.dto.ContactResponse;
import com.saturn.rnd.model.ContactInquiry;
import com.saturn.rnd.repository.ContactInquiryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Year;
import java.util.Random;

/**
 * Business logic service managing visitor contact inquiry submissions.
 */
@Service
@RequiredArgsConstructor
public class ContactService {

    private final ContactInquiryRepository repository;
    private final Random random = new Random();

    @Transactional
    public ContactResponse processInquiry(ContactRequest request) {
        String inquiryId = String.format("INQ-%d-%04d", Year.now().getValue(), random.nextInt(10000));

        ContactInquiry entity = ContactInquiry.builder()
                .inquiryId(inquiryId)
                .name(request.getName())
                .email(request.getEmail())
                .subject(request.getSubject())
                .message(request.getMessage())
                .build();

        repository.save(entity);

        return ContactResponse.builder()
                .inquiryId(inquiryId)
                .build();
    }
}
