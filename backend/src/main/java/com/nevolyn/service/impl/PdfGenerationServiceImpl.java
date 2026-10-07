package com.nevolyn.service.impl;

import com.nevolyn.model.JobApplication;
import com.nevolyn.service.PdfGenerationService;
import com.nevolyn.service.pdf.CandidateApplicationPdfBuilder;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/**
 * Production implementation of {@link PdfGenerationService}.
 *
 * @author NEVOLYN Engineering Standard
 * @version 1.0.0
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PdfGenerationServiceImpl implements PdfGenerationService {

    private final CandidateApplicationPdfBuilder pdfBuilder;

    @Override
    public byte[] generateCandidateDossierPdf(JobApplication application, byte[] originalCvBytes) {
        log.info("Generating unified application dossier PDF for candidate '{}' [Ref: {}]",
                application.getName(), application.getApplicationId());
        return pdfBuilder.buildDossier(application, originalCvBytes);
    }
}
