package com.beautymart.api.security;

public record GoogleIdentity(
        String googleId,
        String email,
        String firstName,
        String lastName,
        String profilePictureUrl
) {
}
