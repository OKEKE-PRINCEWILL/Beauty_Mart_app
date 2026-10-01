package com.beautymart.api.security;

import com.beautymart.api.exception.InvalidGoogleCredentialException;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class GoogleCredentialVerifierImpl implements GoogleCredentialVerifier {

    private final GoogleIdTokenVerifier verifier;

    public GoogleCredentialVerifierImpl(
            @Value("${app.auth.google-client-id}") String googleClientId
    ) {
        this.verifier = new GoogleIdTokenVerifier.Builder(
                new NetHttpTransport(),
                GsonFactory.getDefaultInstance()
        )
                .setAudience(List.of(googleClientId))
                .build();
    }

    @Override
    public GoogleIdentity verify(String credential) {
        try {
            GoogleIdToken idToken = verifier.verify(credential);

            if (idToken == null) {
                throw new InvalidGoogleCredentialException();
            }

            GoogleIdToken.Payload payload = idToken.getPayload();
            if (!Boolean.TRUE.equals(payload.getEmailVerified())) {
                throw new InvalidGoogleCredentialException();
            }

            return new GoogleIdentity(
                    payload.getSubject(),
                    payload.getEmail(),
                    stringClaim(payload, "given_name"),
                    stringClaim(payload, "family_name"),
                    stringClaim(payload, "picture")
            );
        } catch (GeneralSecurityException | IOException | IllegalArgumentException exception) {
            throw new InvalidGoogleCredentialException();
        }
    }

    private String stringClaim(GoogleIdToken.Payload payload, String name) {
        Object value = payload.get(name);
        return value == null ? null : value.toString();
    }
}
