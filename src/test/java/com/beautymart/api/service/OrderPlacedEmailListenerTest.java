package com.beautymart.api.service;

import static org.mockito.ArgumentMatchers.contains;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;

import com.beautymart.api.dto.OrderItemResponse;
import com.beautymart.api.dto.OrderResponse;
import com.beautymart.api.entity.OrderStatus;
import com.beautymart.api.event.OrderPlacedEvent;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class OrderPlacedEmailListenerTest {

    @Mock
    private TransactionalEmailSender emailSender;

    @Test
    void emailsTheCustomerAndStoreOwnerAfterAnOrderIsPlaced() {
        OrderPlacedEmailListener listener = new OrderPlacedEmailListener(emailSender, "owner@example.com");

        listener.onOrderPlaced(new OrderPlacedEvent(order()));

        verify(emailSender).send(
                eq("jane@example.com"),
                eq("Beauty Mart order confirmed — BM-20261001-ABC12345"),
                contains("Hydrating Face Cleanser"),
                contains("Order confirmed")
        );
        verify(emailSender).send(
                eq("owner@example.com"),
                eq("New Beauty Mart order — BM-20261001-ABC12345"),
                contains("08012345678"),
                contains("New order received")
        );
    }

    private OrderResponse order() {
        return new OrderResponse(
                31L,
                "BM-20261001-ABC12345",
                "Jane Doe",
                "jane@example.com",
                "08012345678",
                "12 Example Street",
                "Ikeja",
                new BigDecimal("18900.00"),
                new BigDecimal("18900.00"),
                OrderStatus.PLACED,
                List.of(new OrderItemResponse(
                        71L,
                        1L,
                        "Hydrating Face Cleanser",
                        new BigDecimal("18900.00"),
                        1,
                        new BigDecimal("18900.00")
                )),
                Instant.parse("2026-10-01T12:00:00Z"),
                Instant.parse("2026-10-01T12:00:00Z")
        );
    }
}
