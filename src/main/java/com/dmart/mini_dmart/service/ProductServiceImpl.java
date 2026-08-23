package com.dmart.mini_dmart.service;

import com.dmart.mini_dmart.dto.ProductRequest;
import com.dmart.mini_dmart.dto.ProductResponse;
import com.dmart.mini_dmart.entity.Category;
import com.dmart.mini_dmart.entity.Product;
import com.dmart.mini_dmart.exception.ResourceNotFoundException;
import com.dmart.mini_dmart.repository.CategoryRepository;
import com.dmart.mini_dmart.repository.ProductRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final AuditLogService auditLogService;

    public ProductServiceImpl(
            ProductRepository productRepository,
            CategoryRepository categoryRepository,
            AuditLogService auditLogService) {

        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.auditLogService = auditLogService;
    }

    // =========================================================
    // CREATE PRODUCT
    // =========================================================

    @Override
    @Transactional
    public ProductResponse createProduct(ProductRequest request) {

        Category category =
                categoryRepository.findByIdAndActiveTrue(
                        request.getCategoryId()
                ).orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Category not found with id: "
                                        + request.getCategoryId()
                        )
                );

        Product product = new Product();

        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setStockQuantity(request.getStockQuantity());
        product.setImageUrl(request.getImageUrl());
        product.setCategory(category);

        if (request.getActive() != null) {
            product.setActive(request.getActive());
        } else {
            product.setActive(true);
        }

        Product savedProduct =
                productRepository.save(product);

        // -----------------------------------------------------
        // AUDIT LOG - CREATE PRODUCT
        // -----------------------------------------------------

        auditLogService.createAuditLog(
                "CREATE_PRODUCT",
                "PRODUCT",
                savedProduct.getId(),
                "Product created: "
                        + savedProduct.getName()
        );

        return mapToResponse(savedProduct);
    }

    // =========================================================
    // GET ALL PRODUCTS
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<ProductResponse> getAllProducts() {

        return productRepository.findByActiveTrue()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // =========================================================
    // GET PRODUCT BY ID
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public ProductResponse getProductById(Long id) {

        Product product =
                productRepository.findByIdAndActiveTrue(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Product not found with id: "
                                                + id
                                )
                        );

        return mapToResponse(product);
    }

    // =========================================================
    // SEARCH PRODUCTS
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<ProductResponse> searchProducts(
            String name) {

        return productRepository
                .findByNameContainingIgnoreCaseAndActiveTrue(name)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // =========================================================
    // GET PRODUCTS BY CATEGORY
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<ProductResponse> getProductsByCategory(
            Long categoryId) {

        return productRepository
                .findByCategoryIdAndActiveTrue(categoryId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // =========================================================
    // UPDATE PRODUCT
    // =========================================================

    @Override
    @Transactional
    public ProductResponse updateProduct(
            Long id,
            ProductRequest request) {

        Product product =
                productRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Product not found with id: "
                                                + id
                                )
                        );

        Category category =
                categoryRepository.findByIdAndActiveTrue(
                        request.getCategoryId()
                ).orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Category not found with id: "
                                        + request.getCategoryId()
                        )
                );

        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setStockQuantity(request.getStockQuantity());
        product.setImageUrl(request.getImageUrl());
        product.setCategory(category);

        if (request.getActive() != null) {
            product.setActive(request.getActive());
        }

        Product updatedProduct =
                productRepository.save(product);

        // -----------------------------------------------------
        // AUDIT LOG - UPDATE PRODUCT
        // -----------------------------------------------------

        auditLogService.createAuditLog(
                "UPDATE_PRODUCT",
                "PRODUCT",
                updatedProduct.getId(),
                "Product updated: "
                        + updatedProduct.getName()
        );

        return mapToResponse(updatedProduct);
    }

    // =========================================================
    // DELETE PRODUCT
    // =========================================================

    @Override
    @Transactional
    public void deleteProduct(Long id) {

        Product product =
                productRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Product not found with id: "
                                                + id
                                )
                        );

        // Soft delete

        product.setActive(false);

        Product deletedProduct =
                productRepository.save(product);

        // -----------------------------------------------------
        // AUDIT LOG - DELETE PRODUCT
        // -----------------------------------------------------

        auditLogService.createAuditLog(
                "DELETE_PRODUCT",
                "PRODUCT",
                deletedProduct.getId(),
                "Product soft deleted: "
                        + deletedProduct.getName()
        );
    }

    // =========================================================
    // UPDATE STOCK / INVENTORY
    // =========================================================

    @Override
    @Transactional
    public ProductResponse updateStock(
            Long id,
            Integer quantity) {

        Product product =
                productRepository.findByIdForUpdate(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Product not found with id: "
                                                + id
                                )
                        );

        int oldStock =
                product.getStockQuantity();

        int newStock =
                oldStock + quantity;

        if (newStock < 0) {

            throw new IllegalArgumentException(
                    "Stock quantity cannot be negative"
            );
        }

        product.setStockQuantity(
                newStock
        );

        Product updatedProduct =
                productRepository.save(product);

        // -----------------------------------------------------
        // AUDIT LOG - UPDATE STOCK
        // -----------------------------------------------------

        auditLogService.createAuditLog(
                "UPDATE_STOCK",
                "PRODUCT",
                updatedProduct.getId(),
                "Stock changed from "
                        + oldStock
                        + " to "
                        + newStock
                        + " (change: "
                        + quantity
                        + ")"
        );

        return mapToResponse(
                updatedProduct
        );
    }

    // =========================================================
    // ENTITY -> RESPONSE DTO
    // =========================================================

    private ProductResponse mapToResponse(
            Product product) {

        ProductResponse response =
                new ProductResponse();

        response.setId(
                product.getId()
        );

        response.setName(
                product.getName()
        );

        response.setDescription(
                product.getDescription()
        );

        response.setPrice(
                product.getPrice()
        );

        response.setStockQuantity(
                product.getStockQuantity()
        );

        response.setImageUrl(
                product.getImageUrl()
        );

        response.setActive(
                product.isActive()
        );

        if (product.getCategory() != null) {

            response.setCategoryId(
                    product.getCategory().getId()
            );

            response.setCategoryName(
                    product.getCategory().getName()
            );
        }

        response.setCreatedAt(
                product.getCreatedAt()
        );

        response.setUpdatedAt(
                product.getUpdatedAt()
        );

        return response;
    }
}