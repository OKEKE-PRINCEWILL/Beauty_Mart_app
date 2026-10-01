package com.beautymart.api.exception;

public class CartItemNotFoundException extends RuntimeException {

    public CartItemNotFoundException() {
        super("Cart item was not found");
    }
}
