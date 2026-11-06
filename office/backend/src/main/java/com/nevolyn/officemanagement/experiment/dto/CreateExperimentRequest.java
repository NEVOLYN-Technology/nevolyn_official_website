package com.nevolyn.officemanagement.experiment.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

/**
 * Payload record for registering an R&D laboratory experiment, including
 * objective, procedure, observations, results, and researcher conclusions.
 */
public record CreateExperimentRequest(
        @NotBlank(message = "Experiment title is required")
        @Size(max = 500)
        String title,

        LocalDate experimentDate,
        Long researcherId,
        String objective,
        String procedure,
        String result,
        String observation,
        String conclusion,
        String remarks
) {}
