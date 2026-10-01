package com.beautymart.api.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.beautymart.api.dto.AddCartItemRequest;
import com.beautymart.api.dto.CartResponse;
import com.beautymart.api.dto.UpdateCartItemRequest;
import com.beautymart.api.entity.AppUser;
import com.beautymart.api.entity.CartItem;
import com.beautymart.api.entity.Product;
import com.beautymart.api.exception.CartItemNotFoundException;
import com.beautymart.api.exception.InsufficientStockException;
import com.beautymart.api.repository.CartItemRepository;
import com.beautymart.api.repository.ProductRepository;
import com.beautymart.api.repository.UserRepository;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
class CartServiceTest {

    @Mock
    private CartItemRepository cartItemRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private UserRepository userRepository;

    private CartService cartService;
    private AppUser user;
    private Product product;

    @BeforeEach
    void setUp() {
        cartService = new CartService(cartItemRepository, productRepository, userRepository);
        user = new AppUser("google-123", "jane@example.com", "Jane", "Doe", null);
        ReflectionTestUtils.setField(user, "id", 7L);
        product = new Product(
                "Hydrating Face Cleanser",
                "Beauty Mart",
                "A gentle daily cleanser.",
                new BigDecimal("18900.00"),
                "https://example.com/product.jpg",
                "Skincare",
                25
        );
        ReflectionTestUtils.setField(product, "id", 1L);
    }

    @Test
    void addsAnItemAndCalculatesTheServerSideSubtotal() {
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(cartItemRepository.findByUserIdAndProductId(7L, 1L)).thenReturn(Optional.empty());
        when(userRepository.findById(7L)).thenReturn(Optional.of(user));
        when(cartItemRepository.save(any(CartItem.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
        when(cartItemRepository.findAllByUserIdOrderByCreatedAtAsc(7L))
                .thenAnswer(invocation -> List.of(savedCartItem()));

        CartResponse response = cartService.addItem(7L, new AddCartItemRequest(1L, 2));

        assertThat(response.totalItems()).isEqualTo(2);
        assertThat(response.subtotal()).isEqualByComparingTo("37800.00");
        verify(cartItemRepository).save(any(CartItem.class));
    }

    @Test
    void increasesTheExistingRowInsteadOfCreatingADuplicate() {
        CartItem existingItem = new CartItem(user, product, 1);
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(cartItemRepository.findByUserIdAndProductId(7L, 1L))
                .thenReturn(Optional.of(existingItem));
        when(cartItemRepository.findAllByUserIdOrderByCreatedAtAsc(7L))
                .thenReturn(List.of(existingItem));

        CartResponse response = cartService.addItem(7L, new AddCartItemRequest(1L, 2));

        assertThat(existingItem.getQuantity()).isEqualTo(3);
        assertThat(response.items()).hasSize(1);
        verify(userRepository, never()).findById(any());
    }

    @Test
    void preventsQuantityFromExceedingAvailableStock() {
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(cartItemRepository.findByUserIdAndProductId(7L, 1L)).thenReturn(Optional.empty());

        assertThatThrownBy(
                () -> cartService.addItem(7L, new AddCartItemRequest(1L, 26))
        ).isInstanceOf(InsufficientStockException.class)
                .hasMessageContaining("25 units");

        verify(cartItemRepository, never()).save(any());
    }

    @Test
    void preventsAUserFromUpdatingAnotherUsersCartItem() {
        when(cartItemRepository.findByIdAndUserId(91L, 7L)).thenReturn(Optional.empty());

        assertThatThrownBy(
                () -> cartService.updateItem(7L, 91L, new UpdateCartItemRequest(2))
        ).isInstanceOf(CartItemNotFoundException.class);

        verify(cartItemRepository, never()).save(any());
    }

    @Test
    void clearsOnlyTheAuthenticatedUsersCart() {
        when(cartItemRepository.findAllByUserIdOrderByCreatedAtAsc(7L)).thenReturn(List.of());

        CartResponse response = cartService.clearCart(7L);

        verify(cartItemRepository).deleteAllByUserId(7L);
        assertThat(response.items()).isEmpty();
        assertThat(response.totalItems()).isZero();
        assertThat(response.subtotal()).isEqualByComparingTo(BigDecimal.ZERO);
    }

    private CartItem savedCartItem() {
        CartItem item = new CartItem(user, product, 2);
        ReflectionTestUtils.setField(item, "id", 12L);
        return item;
    }
}
