package com.beautymart.api.dto;

import com.beautymart.api.entity.CartItem;
import java.math.BigDecimal;
import java.util.List;

public record CartResponse(
        List<CartItemResponse> items,
        int totalItems,
        BigDecimal subtotal
) {
    public static CartResponse from(List<CartItem> cartItems) {
        List<CartItemResponse> items = cartItems.stream()
                .map(CartItemResponse::from)
                .toList();
        int totalItems = items.stream()
                .mapToInt(CartItemResponse::quantity)
                .sum();
        BigDecimal subtotal = items.stream()
                .map(CartItemResponse::lineTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new CartResponse(items, totalItems, subtotal);
    }
}
