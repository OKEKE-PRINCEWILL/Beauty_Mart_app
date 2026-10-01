package com.beautymart.api.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.beautymart.api.dto.AuthResponse;
import com.beautymart.api.entity.AppUser;
import com.beautymart.api.exception.UserAccountConflictException;
import com.beautymart.api.repository.UserRepository;
import com.beautymart.api.security.GoogleCredentialVerifier;
import com.beautymart.api.security.GoogleIdentity;
import com.beautymart.api.security.JwtService;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private GoogleCredentialVerifier googleCredentialVerifier;

    @Mock
    private UserRepository userRepository;

    @Mock
    private JwtService jwtService;

    private AuthService authService;

    @BeforeEach
    void setUp() {
        authService = new AuthService(googleCredentialVerifier, userRepository, jwtService);
    }

    @Test
    void createsANewVerifiedGoogleUserAndIssuesAnApplicationToken() {
        GoogleIdentity identity = googleIdentity();
        when(googleCredentialVerifier.verify("google-token")).thenReturn(identity);
        when(userRepository.findByGoogleId(identity.googleId())).thenReturn(Optional.empty());
        when(userRepository.findByEmailIgnoreCase(identity.email())).thenReturn(Optional.empty());
        when(userRepository.save(any(AppUser.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(jwtService.issueToken(any(AppUser.class))).thenReturn("beauty-mart-token");

        AuthResponse response = authService.authenticateWithGoogle("google-token");

        assertThat(response.token()).isEqualTo("beauty-mart-token");
        assertThat(response.user().email()).isEqualTo("jane@example.com");
        assertThat(response.user().firstName()).isEqualTo("Jane");
        verify(userRepository).save(any(AppUser.class));
    }

    @Test
    void reusesAnExistingUserInsteadOfCreatingADuplicate() {
        GoogleIdentity identity = googleIdentity();
        AppUser existingUser = new AppUser(
                identity.googleId(),
                "old-email@example.com",
                "Old",
                "Name",
                null
        );
        when(googleCredentialVerifier.verify("google-token")).thenReturn(identity);
        when(userRepository.findByGoogleId(identity.googleId()))
                .thenReturn(Optional.of(existingUser));
        when(userRepository.findByEmailIgnoreCase(identity.email()))
                .thenReturn(Optional.of(existingUser));
        when(userRepository.save(existingUser)).thenReturn(existingUser);
        when(jwtService.issueToken(existingUser)).thenReturn("beauty-mart-token");

        AuthResponse response = authService.authenticateWithGoogle("google-token");

        assertThat(response.user().email()).isEqualTo(identity.email());
        assertThat(response.user().firstName()).isEqualTo(identity.firstName());
        verify(userRepository).save(existingUser);
    }

    @Test
    void rejectsAnEmailAlreadyLinkedToAnotherGoogleIdentity() {
        GoogleIdentity identity = googleIdentity();
        AppUser emailOwner = new AppUser(
                "different-google-id",
                identity.email(),
                "Jane",
                "Doe",
                null
        );
        when(googleCredentialVerifier.verify("google-token")).thenReturn(identity);
        when(userRepository.findByGoogleId(identity.googleId())).thenReturn(Optional.empty());
        when(userRepository.findByEmailIgnoreCase(identity.email()))
                .thenReturn(Optional.of(emailOwner));

        assertThatThrownBy(() -> authService.authenticateWithGoogle("google-token"))
                .isInstanceOf(UserAccountConflictException.class);
    }

    private GoogleIdentity googleIdentity() {
        return new GoogleIdentity(
                "google-123",
                "jane@example.com",
                "Jane",
                "Doe",
                "https://lh3.googleusercontent.com/profile.jpg"
        );
    }
}
