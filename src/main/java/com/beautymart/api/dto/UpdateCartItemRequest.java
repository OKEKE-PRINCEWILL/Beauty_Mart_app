package com.beautymart.api.dto;

import jakarta.validation.constraints.Positive;

public record UpdateCartItemRequest(
        @Positive(message = "Quantity must be at least one")
        int quantity
) {
}
