package com.nevolyn.service;

import com.nevolyn.model.JobApplication;

/**
 * Generates an official candidate dossier PDF merging applicant credentials,
 * statement of motivation, and the uploaded CV document.
 *
 * @author NEVOLYN Engineering Standard
 * @version 1.0.0
 */
public interface PdfGenerationService {

    /**
     * Generates a unified candidate application dossier PDF with Page 1 credentials
     * and statement, merged with the applicant's uploaded CV document.
     *
     * @param application      persisted job application entity
     * @param originalCvBytes  raw bytes of the uploaded CV document
     * @return complete merged PDF byte array
     */
    byte[] generateCandidateDossierPdf(JobApplication application, byte[] originalCvBytes);
}
