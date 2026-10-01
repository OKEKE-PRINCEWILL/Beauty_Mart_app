package com.beautymart.api.event;

import com.beautymart.api.dto.OrderResponse;

public record OrderPlacedEvent(OrderResponse order) {
}
