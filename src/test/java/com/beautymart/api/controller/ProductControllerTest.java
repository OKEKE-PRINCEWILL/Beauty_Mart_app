package com.beautymart.api.controller;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.beautymart.api.dto.ProductResponse;
import com.beautymart.api.exception.GlobalExceptionHandler;
import com.beautymart.api.exception.ProductNotFoundException;
import com.beautymart.api.service.ProductService;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

@ExtendWith(MockitoExtension.class)
class ProductControllerTest {

    @Mock
    private ProductService productService;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .standaloneSetup(new ProductController(productService))
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    void returnsTheProductCatalog() throws Exception {
        when(productService.getProducts()).thenReturn(List.of(productResponse()));

        mockMvc.perform(get("/api/products"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].name").value("Hydrating Face Cleanser"))
                .andExpect(jsonPath("$[0].price").value(18900.00));
    }

    @Test
    void returnsNotFoundForAnUnknownProduct() throws Exception {
        when(productService.getProduct(99L)).thenThrow(new ProductNotFoundException(99L));

        mockMvc.perform(get("/api/products/99"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.message").value("Product with id 99 was not found"));
    }

    private ProductResponse productResponse() {
        Instant now = Instant.parse("2026-09-30T12:00:00Z");
        return new ProductResponse(
                1L,
                "Hydrating Face Cleanser",
                "Beauty Mart",
                "A gentle daily cleanser.",
                new BigDecimal("18900.00"),
                "https://example.com/product.jpg",
                "Skincare",
                25,
                now,
                now
        );
    }
}
