package com.nevolyn.officemanagement.common.exception;

/**
 * Thrown when a business rule is violated (HTTP 409 or 400).
 *
 * <p>Examples: duplicate attendance check-in, invalid status transition.
 */
public class BusinessRuleException extends RuntimeException {

    public BusinessRuleException(String message) {
        super(message);
    }
}
