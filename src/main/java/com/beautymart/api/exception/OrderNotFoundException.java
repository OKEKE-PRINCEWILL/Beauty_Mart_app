package com.beautymart.api.exception;

public class OrderNotFoundException extends RuntimeException {

    public OrderNotFoundException() {
        super("Order was not found");
    }
}
