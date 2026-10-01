package com.beautymart.api.dto;

import com.beautymart.api.entity.CustomerOrder;
import com.beautymart.api.entity.OrderStatus;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record OrderResponse(
        Long id,
        String orderNumber,
        String fullName,
        String email,
        String phoneNumber,
        String deliveryAddress,
        String deliveryArea,
        BigDecimal subtotal,
        BigDecimal total,
        OrderStatus status,
        List<OrderItemResponse> items,
        Instant createdAt,
        Instant updatedAt
) {
    public static OrderResponse from(CustomerOrder order) {
        return new OrderResponse(
                order.getId(),
                order.getOrderNumber(),
                order.getFullName(),
                order.getEmail(),
                order.getPhoneNumber(),
                order.getDeliveryAddress(),
                order.getDeliveryArea(),
                order.getSubtotal(),
                order.getTotal(),
                order.getStatus(),
                order.getItems().stream().map(OrderItemResponse::from).toList(),
                order.getCreatedAt(),
                order.getUpdatedAt()
        );
    }
}
