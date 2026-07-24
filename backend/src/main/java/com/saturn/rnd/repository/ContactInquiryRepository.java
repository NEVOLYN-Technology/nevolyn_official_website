package com.saturn.rnd.repository;

import com.saturn.rnd.model.ContactInquiry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ContactInquiryRepository extends JpaRepository<ContactInquiry, Long> {
    Optional<ContactInquiry> findByInquiryId(String inquiryId);
}
