package com.beautymart.api.dto;

import com.beautymart.api.entity.CartItem;
import java.math.BigDecimal;
import java.time.Instant;

public record CartItemResponse(
        Long id,
        ProductResponse product,
        int quantity,
        BigDecimal lineTotal,
        Instant createdAt,
        Instant updatedAt
) {
    public static CartItemResponse from(CartItem cartItem) {
        return new CartItemResponse(
                cartItem.getId(),
                ProductResponse.from(cartItem.getProduct()),
                cartItem.getQuantity(),
                cartItem.getProduct().getPrice()
                        .multiply(BigDecimal.valueOf(cartItem.getQuantity())),
                cartItem.getCreatedAt(),
                cartItem.getUpdatedAt()
        );
    }
}
