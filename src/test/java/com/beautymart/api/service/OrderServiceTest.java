package com.beautymart.api.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.beautymart.api.dto.CheckoutRequest;
import com.beautymart.api.dto.OrderResponse;
import com.beautymart.api.entity.AppUser;
import com.beautymart.api.entity.CartItem;
import com.beautymart.api.entity.CustomerOrder;
import com.beautymart.api.entity.OrderStatus;
import com.beautymart.api.entity.Product;
import com.beautymart.api.exception.EmptyCartException;
import com.beautymart.api.exception.InsufficientStockException;
import com.beautymart.api.exception.OrderNotFoundException;
import com.beautymart.api.repository.CartItemRepository;
import com.beautymart.api.repository.OrderRepository;
import com.beautymart.api.repository.ProductRepository;
import com.beautymart.api.repository.UserRepository;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.context.ApplicationEventPublisher;
import com.beautymart.api.event.OrderPlacedEvent;
import org.mockito.ArgumentCaptor;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private CartItemRepository cartItemRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private OrderNumberGenerator orderNumberGenerator;

    @Mock
    private ApplicationEventPublisher eventPublisher;

    private OrderService orderService;
    private AppUser user;

    @BeforeEach
    void setUp() {
        orderService = new OrderService(
                orderRepository,
                cartItemRepository,
                productRepository,
                userRepository,
                orderNumberGenerator,
                eventPublisher
        );
        user = new AppUser("google-123", "jane@example.com", "Jane", "Doe", null);
        ReflectionTestUtils.setField(user, "id", 7L);
    }

    @Test
    void createsOrderSnapshotsFromCurrentPricesAndClearsTheCart() {
        Product cartProduct = product("15000.00", 25);
        Product currentProduct = product("18900.00", 25);
        CartItem cartItem = new CartItem(user, cartProduct, 2);
        when(userRepository.findById(7L)).thenReturn(Optional.of(user));
        when(cartItemRepository.findAllByUserIdOrderByCreatedAtAsc(7L))
                .thenReturn(List.of(cartItem));
        when(productRepository.findByIdForUpdate(1L)).thenReturn(Optional.of(currentProduct));
        when(orderNumberGenerator.generate()).thenReturn("BM-20261001-ABC12345");
        when(orderRepository.save(any(CustomerOrder.class))).thenAnswer(invocation -> {
            CustomerOrder order = invocation.getArgument(0);
            ReflectionTestUtils.setField(order, "id", 31L);
            ReflectionTestUtils.setField(order, "createdAt", Instant.parse("2026-10-01T12:00:00Z"));
            ReflectionTestUtils.setField(order, "updatedAt", Instant.parse("2026-10-01T12:00:00Z"));
            return order;
        });

        OrderResponse response = orderService.placeOrder(7L, checkoutRequest());

        assertThat(response.orderNumber()).isEqualTo("BM-20261001-ABC12345");
        assertThat(response.status()).isEqualTo(OrderStatus.PLACED);
        assertThat(response.subtotal()).isEqualByComparingTo("37800.00");
        assertThat(response.total()).isEqualByComparingTo("37800.00");
        assertThat(response.items()).singleElement().satisfies(item -> {
            assertThat(item.productName()).isEqualTo("Hydrating Face Cleanser");
            assertThat(item.price()).isEqualByComparingTo("18900.00");
            assertThat(item.quantity()).isEqualTo(2);
        });
        assertThat(currentProduct.getStock()).isEqualTo(23);
        verify(productRepository).saveAll(List.of(currentProduct));
        verify(cartItemRepository).deleteAllByUserId(7L);
        ArgumentCaptor<OrderPlacedEvent> eventCaptor = ArgumentCaptor.forClass(OrderPlacedEvent.class);
        verify(eventPublisher).publishEvent(eventCaptor.capture());
        assertThat(eventCaptor.getValue().order().id()).isEqualTo(31L);
    }

    @Test
    void rejectsCheckoutWhenTheCartIsEmpty() {
        when(userRepository.findById(7L)).thenReturn(Optional.of(user));
        when(cartItemRepository.findAllByUserIdOrderByCreatedAtAsc(7L))
                .thenReturn(List.of());

        assertThatThrownBy(() -> orderService.placeOrder(7L, checkoutRequest()))
                .isInstanceOf(EmptyCartException.class);

        verify(orderRepository, never()).save(any());
        verify(cartItemRepository, never()).deleteAllByUserId(any());
    }

    @Test
    void leavesTheCartAndStockUntouchedWhenStockIsInsufficient() {
        Product product = product("18900.00", 1);
        CartItem cartItem = new CartItem(user, product, 2);
        when(userRepository.findById(7L)).thenReturn(Optional.of(user));
        when(cartItemRepository.findAllByUserIdOrderByCreatedAtAsc(7L))
                .thenReturn(List.of(cartItem));
        when(productRepository.findByIdForUpdate(1L)).thenReturn(Optional.of(product));

        assertThatThrownBy(() -> orderService.placeOrder(7L, checkoutRequest()))
                .isInstanceOf(InsufficientStockException.class);

        assertThat(product.getStock()).isEqualTo(1);
        verify(productRepository, never()).saveAll(any());
        verify(orderRepository, never()).save(any());
        verify(cartItemRepository, never()).deleteAllByUserId(any());
    }

    @Test
    void returnsOnlyOrdersBelongingToTheAuthenticatedUser() {
        CustomerOrder order = completedOrder();
        when(orderRepository.findAllByUserIdOrderByCreatedAtDesc(7L))
                .thenReturn(List.of(order));

        List<OrderResponse> orders = orderService.getOrders(7L);

        assertThat(orders).singleElement()
                .extracting(OrderResponse::orderNumber)
                .isEqualTo("BM-20261001-ABC12345");
        verify(orderRepository).findAllByUserIdOrderByCreatedAtDesc(7L);
    }

    @Test
    void doesNotReturnAnOrderOwnedByAnotherUser() {
        when(orderRepository.findByIdAndUserId(31L, 7L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> orderService.getOrder(7L, 31L))
                .isInstanceOf(OrderNotFoundException.class)
                .hasMessage("Order was not found");
    }

    private CheckoutRequest checkoutRequest() {
        return new CheckoutRequest(
                "Jane Doe",
                "jane@example.com",
                "08012345678",
                "12 Example Street, near the town hall",
                "Ikeja"
        );
    }

    private Product product(String price, int stock) {
        Product product = new Product(
                "Hydrating Face Cleanser",
                "Beauty Mart",
                "A gentle daily cleanser.",
                new BigDecimal(price),
                "https://example.com/product.jpg",
                "Skincare",
                stock
        );
        ReflectionTestUtils.setField(product, "id", 1L);
        return product;
    }

    private CustomerOrder completedOrder() {
        CustomerOrder order = new CustomerOrder(
                "BM-20261001-ABC12345",
                user,
                "Jane Doe",
                "jane@example.com",
                "08012345678",
                "12 Example Street, near the town hall",
                "Ikeja",
                new BigDecimal("18900.00"),
                new BigDecimal("18900.00")
        );
        ReflectionTestUtils.setField(order, "id", 31L);
        ReflectionTestUtils.setField(order, "createdAt", Instant.parse("2026-10-01T12:00:00Z"));
        ReflectionTestUtils.setField(order, "updatedAt", Instant.parse("2026-10-01T12:00:00Z"));
        return order;
    }
}
