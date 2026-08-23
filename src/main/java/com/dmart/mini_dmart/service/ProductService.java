package com.dmart.mini_dmart.service;

import com.dmart.mini_dmart.dto.ProductRequest;
import com.dmart.mini_dmart.dto.ProductResponse;

import java.util.List;

public interface ProductService {

    ProductResponse createProduct(ProductRequest request);

    List<ProductResponse> getAllProducts();

    ProductResponse getProductById(Long id);

    List<ProductResponse> searchProducts(String name);

    List<ProductResponse> getProductsByCategory(Long categoryId);

    ProductResponse updateProduct(Long id, ProductRequest request);

    void deleteProduct(Long id);

    ProductResponse updateStock(Long id, Integer quantity);
}