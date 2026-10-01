package com.beautymart.api.exception;

public class UserAccountConflictException extends RuntimeException {

    public UserAccountConflictException() {
        super("An account already exists for this email with a different Google identity");
    }
}
