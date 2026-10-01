package com.beautymart.api.dto;

public record AuthResponse(
        String token,
        UserResponse user
) {
}
