package com.beautymart.api.repository;

import com.beautymart.api.entity.CartItem;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {

    @EntityGraph(attributePaths = "product")
    List<CartItem> findAllByUserIdOrderByCreatedAtAsc(Long userId);

    @EntityGraph(attributePaths = "product")
    Optional<CartItem> findByUserIdAndProductId(Long userId, Long productId);

    @EntityGraph(attributePaths = "product")
    Optional<CartItem> findByIdAndUserId(Long id, Long userId);

    long deleteAllByUserId(Long userId);
}
