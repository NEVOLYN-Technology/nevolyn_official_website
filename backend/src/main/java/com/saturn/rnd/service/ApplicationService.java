package com.saturn.rnd.service;

import com.saturn.rnd.dto.ApplicationResponse;
import com.saturn.rnd.model.JobApplication;
import com.saturn.rnd.repository.JobApplicationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.Year;
import java.util.Random;

/**
 * Business logic service managing job application file uploads and DB storage.
 */
@Service
@RequiredArgsConstructor
public class ApplicationService {

    private final JobApplicationRepository repository;
    private final FileStorageService fileStorageService;
    private final Random random = new Random();

    @Transactional
    public ApplicationResponse processApplication(
            String name,
            String email,
            String phone,
            String address,
            String reason,
            String linkedin,
            String github,
            String website,
            MultipartFile resume
    ) {
        String applicationId = String.format("APP-%d-%04d", Year.now().getValue(), random.nextInt(10000));
        String storedPath = fileStorageService.storeFile(resume, applicationId + "_" + name.replaceAll("\\s+", "_").toLowerCase());

        JobApplication entity = JobApplication.builder()
                .applicationId(applicationId)
                .name(name)
                .email(email)
                .phone(phone)
                .address(address)
                .reason(reason)
                .linkedin(linkedin)
                .github(github)
                .website(website)
                .resumePath(storedPath)
                .originalFileName(resume.getOriginalFilename())
                .build();

        repository.save(entity);

        return ApplicationResponse.builder()
                .applicationId(applicationId)
                .fileName(resume.getOriginalFilename())
                .build();
    }
}
