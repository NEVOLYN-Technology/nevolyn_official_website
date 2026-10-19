package com.nevolyn.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Payload for updating an entity's status in the Admin dashboard.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminStatusUpdateRequest {

    @NotBlank(message = "Status cannot be blank")
    private String status;

    private String reviewNotes;
}
