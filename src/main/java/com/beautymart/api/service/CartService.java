package com.beautymart.api.service;

import com.beautymart.api.dto.AddCartItemRequest;
import com.beautymart.api.dto.CartResponse;
import com.beautymart.api.dto.UpdateCartItemRequest;
import com.beautymart.api.entity.AppUser;
import com.beautymart.api.entity.CartItem;
import com.beautymart.api.entity.Product;
import com.beautymart.api.exception.AuthenticatedUserNotFoundException;
import com.beautymart.api.exception.CartItemNotFoundException;
import com.beautymart.api.exception.InsufficientStockException;
import com.beautymart.api.exception.InvalidCartQuantityException;
import com.beautymart.api.exception.ProductNotFoundException;
import com.beautymart.api.repository.CartItemRepository;
import com.beautymart.api.repository.ProductRepository;
import com.beautymart.api.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CartService {

    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public CartService(
            CartItemRepository cartItemRepository,
            ProductRepository productRepository,
            UserRepository userRepository
    ) {
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public CartResponse getCart(Long userId) {
        return currentCart(userId);
    }

    @Transactional
    public CartResponse addItem(Long userId, AddCartItemRequest request) {
        validateQuantity(request.quantity());
        Product product = productRepository.findById(request.productId())
                .orElseThrow(() -> new ProductNotFoundException(request.productId()));

        CartItem cartItem = cartItemRepository
                .findByUserIdAndProductId(userId, product.getId())
                .map(existingItem -> {
                    int newQuantity = existingItem.getQuantity() + request.quantity();
                    validateStock(product, newQuantity);
                    existingItem.changeQuantity(newQuantity);
                    return existingItem;
                })
                .orElseGet(() -> {
                    validateStock(product, request.quantity());
                    AppUser user = userRepository.findById(userId)
                            .orElseThrow(AuthenticatedUserNotFoundException::new);
                    return new CartItem(user, product, request.quantity());
                });

        cartItemRepository.save(cartItem);
        return currentCart(userId);
    }

    @Transactional
    public CartResponse updateItem(Long userId, Long cartItemId, UpdateCartItemRequest request) {
        validateQuantity(request.quantity());
        CartItem cartItem = ownedCartItem(userId, cartItemId);
        validateStock(cartItem.getProduct(), request.quantity());
        cartItem.changeQuantity(request.quantity());
        cartItemRepository.save(cartItem);
        return currentCart(userId);
    }

    @Transactional
    public CartResponse removeItem(Long userId, Long cartItemId) {
        CartItem cartItem = ownedCartItem(userId, cartItemId);
        cartItemRepository.delete(cartItem);
        return currentCart(userId);
    }

    @Transactional
    public CartResponse clearCart(Long userId) {
        cartItemRepository.deleteAllByUserId(userId);
        return currentCart(userId);
    }

    private CartItem ownedCartItem(Long userId, Long cartItemId) {
        return cartItemRepository.findByIdAndUserId(cartItemId, userId)
                .orElseThrow(CartItemNotFoundException::new);
    }

    private CartResponse currentCart(Long userId) {
        return CartResponse.from(
                cartItemRepository.findAllByUserIdOrderByCreatedAtAsc(userId)
        );
    }

    private void validateQuantity(int quantity) {
        if (quantity < 1) {
            throw new InvalidCartQuantityException();
        }
    }

    private void validateStock(Product product, int requestedQuantity) {
        if (requestedQuantity > product.getStock()) {
            throw new InsufficientStockException(product.getName(), product.getStock());
        }
    }
}
