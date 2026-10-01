package com.beautymart.api.service;

import com.beautymart.api.dto.ProductResponse;
import com.beautymart.api.entity.Product;
import com.beautymart.api.exception.ProductNotFoundException;
import com.beautymart.api.repository.ProductRepository;
import java.util.List;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class ProductService {

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public List<ProductResponse> getProducts() {
        return productRepository.findAll(Sort.by(Sort.Direction.ASC, "id"))
                .stream()
                .map(ProductResponse::from)
                .toList();
    }

    public ProductResponse getProduct(long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ProductNotFoundException(productId));

        return ProductResponse.from(product);
    }
}
