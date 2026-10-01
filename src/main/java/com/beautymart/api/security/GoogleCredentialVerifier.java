package com.beautymart.api.security;

public interface GoogleCredentialVerifier {

    GoogleIdentity verify(String credential);
}
