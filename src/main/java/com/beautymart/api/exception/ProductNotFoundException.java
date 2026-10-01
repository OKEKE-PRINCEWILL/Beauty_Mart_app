package com.beautymart.api.exception;

public class ProductNotFoundException extends RuntimeException {

    public ProductNotFoundException(long productId) {
        super("Product with id " + productId + " was not found");
    }
}
