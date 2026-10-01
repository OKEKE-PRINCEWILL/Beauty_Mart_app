package com.beautymart.api.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.beautymart.api.dto.ProductResponse;
import com.beautymart.api.entity.Product;
import com.beautymart.api.exception.ProductNotFoundException;
import com.beautymart.api.repository.ProductRepository;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Sort;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private ProductService productService;

    @Test
    void returnsProductsFromTheRepository() {
        Product cleanser = product("Hydrating Face Cleanser");
        when(productRepository.findAll(any(Sort.class))).thenReturn(List.of(cleanser));

        List<ProductResponse> products = productService.getProducts();

        assertEquals(1, products.size());
        assertEquals("Hydrating Face Cleanser", products.getFirst().name());
    }

    @Test
    void returnsOneProductById() {
        Product cleanser = product("Hydrating Face Cleanser");
        when(productRepository.findById(1L)).thenReturn(Optional.of(cleanser));

        ProductResponse product = productService.getProduct(1L);

        assertEquals("Hydrating Face Cleanser", product.name());
        verify(productRepository).findById(1L);
    }

    @Test
    void throwsWhenProductDoesNotExist() {
        when(productRepository.findById(99L)).thenReturn(Optional.empty());

        ProductNotFoundException exception = assertThrows(
                ProductNotFoundException.class,
                () -> productService.getProduct(99L)
        );

        assertEquals("Product with id 99 was not found", exception.getMessage());
    }

    private Product product(String name) {
        return new Product(
                name,
                "Beauty Mart",
                "A gentle daily cleanser.",
                new BigDecimal("18900.00"),
                "https://example.com/product.jpg",
                "Skincare",
                25
        );
    }
}
