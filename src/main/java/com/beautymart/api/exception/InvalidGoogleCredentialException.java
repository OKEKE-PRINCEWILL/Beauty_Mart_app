package com.beautymart.api.exception;

public class InvalidGoogleCredentialException extends RuntimeException {

    public InvalidGoogleCredentialException() {
        super("Google credential is invalid or expired");
    }
}
