package com.nevolyn.officemanagement.auth.dto;

// Container representing successful authentication result with user details and JWT token.
public record AuthResult(LoginResponse user, String token) {}

