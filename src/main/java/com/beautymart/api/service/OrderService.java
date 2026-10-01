package com.beautymart.api.service;

import com.beautymart.api.dto.CheckoutRequest;
import com.beautymart.api.dto.OrderResponse;
import com.beautymart.api.entity.AppUser;
import com.beautymart.api.entity.CartItem;
import com.beautymart.api.entity.CustomerOrder;
import com.beautymart.api.entity.OrderItem;
import com.beautymart.api.entity.Product;
import com.beautymart.api.exception.AuthenticatedUserNotFoundException;
import com.beautymart.api.exception.EmptyCartException;
import com.beautymart.api.exception.InsufficientStockException;
import com.beautymart.api.exception.OrderNotFoundException;
import com.beautymart.api.exception.ProductNotFoundException;
import com.beautymart.api.event.OrderPlacedEvent;
import com.beautymart.api.repository.CartItemRepository;
import com.beautymart.api.repository.OrderRepository;
import com.beautymart.api.repository.ProductRepository;
import com.beautymart.api.repository.UserRepository;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final OrderNumberGenerator orderNumberGenerator;
    private final ApplicationEventPublisher eventPublisher;

    public OrderService(
            OrderRepository orderRepository,
            CartItemRepository cartItemRepository,
            ProductRepository productRepository,
            UserRepository userRepository,
            OrderNumberGenerator orderNumberGenerator,
            ApplicationEventPublisher eventPublisher
    ) {
        this.orderRepository = orderRepository;
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.orderNumberGenerator = orderNumberGenerator;
        this.eventPublisher = eventPublisher;
    }

    @Transactional
    public OrderResponse placeOrder(Long userId, CheckoutRequest request) {
        AppUser user = userRepository.findById(userId)
                .orElseThrow(AuthenticatedUserNotFoundException::new);
        List<CartItem> cartItems = cartItemRepository
                .findAllByUserIdOrderByCreatedAtAsc(userId);

        if (cartItems.isEmpty()) {
            throw new EmptyCartException();
        }

        List<PreparedOrderItem> preparedItems = new ArrayList<>();
        List<Product> lockedProducts = new ArrayList<>();
        BigDecimal subtotal = BigDecimal.ZERO;

        for (CartItem cartItem : cartItems) {
            Long productId = cartItem.getProduct().getId();
            Product product = productRepository.findByIdForUpdate(productId)
                    .orElseThrow(() -> new ProductNotFoundException(productId));

            if (cartItem.getQuantity() > product.getStock()) {
                throw new InsufficientStockException(product.getName(), product.getStock());
            }

            BigDecimal lineTotal = product.getPrice()
                    .multiply(BigDecimal.valueOf(cartItem.getQuantity()));
            subtotal = subtotal.add(lineTotal);
            preparedItems.add(new PreparedOrderItem(product, cartItem.getQuantity()));
            product.reduceStock(cartItem.getQuantity());
            lockedProducts.add(product);
        }

        CustomerOrder order = new CustomerOrder(
                orderNumberGenerator.generate(),
                user,
                request.fullName().trim(),
                request.email().trim().toLowerCase(),
                request.phoneNumber().trim(),
                request.deliveryAddress().trim(),
                request.deliveryArea().trim(),
                subtotal,
                subtotal
        );

        for (PreparedOrderItem preparedItem : preparedItems) {
            Product product = preparedItem.product();
            order.addItem(new OrderItem(
                    order,
                    product.getId(),
                    product.getName(),
                    product.getPrice(),
                    preparedItem.quantity()
            ));
        }

        productRepository.saveAll(lockedProducts);
        CustomerOrder savedOrder = orderRepository.save(order);
        cartItemRepository.deleteAllByUserId(userId);
        OrderResponse response = OrderResponse.from(savedOrder);
        eventPublisher.publishEvent(new OrderPlacedEvent(response));
        return response;
    }

    private record PreparedOrderItem(Product product, int quantity) {
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getOrders(Long userId) {
        return orderRepository.findAllByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(OrderResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrder(Long userId, Long orderId) {
        return orderRepository.findByIdAndUserId(orderId, userId)
                .map(OrderResponse::from)
                .orElseThrow(OrderNotFoundException::new);
    }
}
