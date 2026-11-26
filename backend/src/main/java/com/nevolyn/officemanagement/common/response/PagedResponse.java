package com.nevolyn.officemanagement.common.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import org.springframework.data.domain.Page;

import java.util.List;

/**
 * Paginated API response wrapper for list endpoints.
 *
 * @param <T> the type of each item in the page
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record PagedResponse<T>(
        boolean success,
        List<T> data,
        int page,
        int size,
        long totalElements,
        int totalPages,
        boolean last
) {

    /**
     * Build a PagedResponse from a Spring Data {@link Page}.
     */
    public static <T> PagedResponse<T> of(Page<T> page) {
        return new PagedResponse<>(
                true,
                page.getContent(),
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isLast()
        );
    }
}
