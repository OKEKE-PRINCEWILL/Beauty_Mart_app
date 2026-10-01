package com.beautymart.api.security;

import static org.assertj.core.api.Assertions.assertThat;

import com.beautymart.api.entity.AppUser;
import com.nimbusds.jose.jwk.source.ImmutableSecret;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import org.junit.jupiter.api.Test;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtValidators;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;
import org.springframework.test.util.ReflectionTestUtils;

class JwtServiceTest {

    private static final String SECRET = "a-test-secret-that-is-at-least-thirty-two-bytes-long";

    @Test
    void issuesAnHs256TokenThatTheConfiguredDecoderCanRead() {
        SecretKey key = new SecretKeySpec(SECRET.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        JwtEncoder encoder = new NimbusJwtEncoder(new ImmutableSecret<>(key));
        NimbusJwtDecoder decoder = NimbusJwtDecoder.withSecretKey(key).build();
        decoder.setJwtValidator(JwtValidators.createDefaultWithIssuer("beauty-mart-api"));
        JwtService service = new JwtService(encoder, Duration.ofHours(12));

        AppUser user = new AppUser(
                "google-user-42",
                "customer@example.com",
                "Ada",
                "Lovelace",
                null
        );
        ReflectionTestUtils.setField(user, "id", 42L);

        Jwt jwt = decoder.decode(service.issueToken(user));

        assertThat(jwt.getSubject()).isEqualTo("42");
        assertThat(jwt.getClaimAsString("email")).isEqualTo("customer@example.com");
        assertThat(jwt.getClaimAsString("firstName")).isEqualTo("Ada");
        assertThat(jwt.getHeaders()).containsEntry("alg", "HS256");
    }
}
