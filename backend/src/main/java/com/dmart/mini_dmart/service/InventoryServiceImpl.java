package com.dmart.mini_dmart.service;

import com.dmart.mini_dmart.dto.InventoryResponse;
import com.dmart.mini_dmart.dto.UpdateInventoryRequest;
import com.dmart.mini_dmart.entity.Product;
import com.dmart.mini_dmart.exception.ResourceNotFoundException;
import com.dmart.mini_dmart.repository.ProductRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class InventoryServiceImpl implements InventoryService {

    private static final int LOW_STOCK_THRESHOLD = 10;

    private final ProductRepository productRepository;

    public InventoryServiceImpl(
            ProductRepository productRepository) {

        this.productRepository = productRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public InventoryResponse getInventory(Long productId) {

        Product product =
                productRepository.findById(productId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Product not found with id: "
                                                + productId
                                )
                        );

        return mapToResponse(product);
    }

    @Override
    @Transactional(readOnly = true)
    public List<InventoryResponse> getAllInventory() {

        return productRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public InventoryResponse updateInventory(
            Long productId,
            UpdateInventoryRequest request) {

        Product product =
                productRepository.findById(productId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Product not found with id: "
                                                + productId
                                )
                        );

        product.setStockQuantity(
                request.getStockQuantity()
        );

        Product updatedProduct =
                productRepository.save(product);

        return mapToResponse(updatedProduct);
    }

    private InventoryResponse mapToResponse(
            Product product) {

        InventoryResponse response =
                new InventoryResponse();

        response.setProductId(
                product.getId()
        );

        response.setProductName(
                product.getName()
        );

        response.setStockQuantity(
                product.getStockQuantity()
        );

        response.setActive(
                product.isActive()
        );

        response.setLowStock(
                product.getStockQuantity()
                        <= LOW_STOCK_THRESHOLD
        );

        response.setUpdatedAt(
                product.getUpdatedAt()
        );

        return response;
    }
}