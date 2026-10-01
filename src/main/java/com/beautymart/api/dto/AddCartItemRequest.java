package com.beautymart.api.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record AddCartItemRequest(
        @NotNull(message = "Product id is required")
        @Positive(message = "Product id must be positive")
        Long productId,

        @Positive(message = "Quantity must be at least one")
        int quantity
) {
}
