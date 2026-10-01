package com.beautymart.api.service;

import com.beautymart.api.dto.AuthResponse;
import com.beautymart.api.dto.UserResponse;
import com.beautymart.api.entity.AppUser;
import com.beautymart.api.exception.AuthenticatedUserNotFoundException;
import com.beautymart.api.exception.UserAccountConflictException;
import com.beautymart.api.repository.UserRepository;
import com.beautymart.api.security.GoogleCredentialVerifier;
import com.beautymart.api.security.GoogleIdentity;
import com.beautymart.api.security.JwtService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final GoogleCredentialVerifier googleCredentialVerifier;
    private final UserRepository userRepository;
    private final JwtService jwtService;

    public AuthService(
            GoogleCredentialVerifier googleCredentialVerifier,
            UserRepository userRepository,
            JwtService jwtService
    ) {
        this.googleCredentialVerifier = googleCredentialVerifier;
        this.userRepository = userRepository;
        this.jwtService = jwtService;
    }

    @Transactional
    public AuthResponse authenticateWithGoogle(String credential) {
        GoogleIdentity identity = googleCredentialVerifier.verify(credential);
        AppUser user = userRepository.findByGoogleId(identity.googleId())
                .map(existingUser -> updateExistingUser(existingUser, identity))
                .orElseGet(() -> createUser(identity));

        AppUser savedUser = userRepository.save(user);
        return new AuthResponse(jwtService.issueToken(savedUser), UserResponse.from(savedUser));
    }

    @Transactional(readOnly = true)
    public UserResponse getAuthenticatedUser(Long userId) {
        return userRepository.findById(userId)
                .map(UserResponse::from)
                .orElseThrow(AuthenticatedUserNotFoundException::new);
    }

    private AppUser createUser(GoogleIdentity identity) {
        if (userRepository.findByEmailIgnoreCase(identity.email()).isPresent()) {
            throw new UserAccountConflictException();
        }

        return new AppUser(
                identity.googleId(),
                identity.email(),
                normalizedFirstName(identity),
                identity.lastName(),
                identity.profilePictureUrl()
        );
    }

    private AppUser updateExistingUser(AppUser user, GoogleIdentity identity) {
        userRepository.findByEmailIgnoreCase(identity.email())
                .filter(emailOwner -> !emailOwner.getGoogleId().equals(identity.googleId()))
                .ifPresent(emailOwner -> {
                    throw new UserAccountConflictException();
                });

        user.updateProfile(
                identity.email(),
                normalizedFirstName(identity),
                identity.lastName(),
                identity.profilePictureUrl()
        );
        return user;
    }

    private String normalizedFirstName(GoogleIdentity identity) {
        if (identity.firstName() != null && !identity.firstName().isBlank()) {
            return identity.firstName();
        }
        return identity.email().substring(0, identity.email().indexOf('@'));
    }
}
