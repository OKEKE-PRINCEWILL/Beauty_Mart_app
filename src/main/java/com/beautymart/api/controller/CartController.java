package com.beautymart.api.controller;

import com.beautymart.api.dto.AddCartItemRequest;
import com.beautymart.api.dto.CartResponse;
import com.beautymart.api.dto.UpdateCartItemRequest;
import com.beautymart.api.service.CartService;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @GetMapping
    public CartResponse getCart(@AuthenticationPrincipal Jwt jwt) {
        return cartService.getCart(userId(jwt));
    }

    @PostMapping("/items")
    public CartResponse addItem(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody AddCartItemRequest request
    ) {
        return cartService.addItem(userId(jwt), request);
    }

    @PatchMapping("/items/{cartItemId}")
    public CartResponse updateItem(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable Long cartItemId,
            @Valid @RequestBody UpdateCartItemRequest request
    ) {
        return cartService.updateItem(userId(jwt), cartItemId, request);
    }

    @DeleteMapping("/items/{cartItemId}")
    public CartResponse removeItem(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable Long cartItemId
    ) {
        return cartService.removeItem(userId(jwt), cartItemId);
    }

    @DeleteMapping
    public CartResponse clearCart(@AuthenticationPrincipal Jwt jwt) {
        return cartService.clearCart(userId(jwt));
    }

    private Long userId(Jwt jwt) {
        return Long.valueOf(jwt.getSubject());
    }
}
