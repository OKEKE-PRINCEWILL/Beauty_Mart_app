package com.beautymart.api.exception;

public class InvalidCartQuantityException extends RuntimeException {

    public InvalidCartQuantityException() {
        super("Quantity must be at least one");
    }
}
