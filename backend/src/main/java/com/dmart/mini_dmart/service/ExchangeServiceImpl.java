package com.dmart.mini_dmart.service;

import com.dmart.mini_dmart.dto.ExchangeRequestDto;
import com.dmart.mini_dmart.entity.ExchangeRequest;
import com.dmart.mini_dmart.entity.ExchangeStatus;
import com.dmart.mini_dmart.entity.Order;
import com.dmart.mini_dmart.entity.OrderItem;
import com.dmart.mini_dmart.entity.OrderStatus;
import com.dmart.mini_dmart.entity.Product;
import com.dmart.mini_dmart.entity.User;
import com.dmart.mini_dmart.exception.ResourceNotFoundException;
import com.dmart.mini_dmart.repository.ExchangeRequestRepository;
import com.dmart.mini_dmart.repository.OrderItemRepository;
import com.dmart.mini_dmart.repository.ProductRepository;
import com.dmart.mini_dmart.repository.UserRepository;
import com.dmart.mini_dmart.security.CustomUserDetails;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ExchangeServiceImpl implements ExchangeService {

    private final ExchangeRequestRepository exchangeRequestRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;

    public ExchangeServiceImpl(
            ExchangeRequestRepository exchangeRequestRepository,
            OrderItemRepository orderItemRepository,
            ProductRepository productRepository,
            UserRepository userRepository,
            AuditLogService auditLogService) {

        this.exchangeRequestRepository = exchangeRequestRepository;
        this.orderItemRepository = orderItemRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.auditLogService = auditLogService;
    }

    // =========================================================
    // CREATE EXCHANGE REQUEST - CUSTOMER
    // =========================================================

    @Override
    @Transactional
    public ExchangeRequestDto createExchangeRequest(
            ExchangeRequestDto request) {

        User user = getAuthenticatedUser();

        OrderItem orderItem =
                orderItemRepository.findById(
                        request.getOrderItemId()
                ).orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Order item not found with id: "
                                        + request.getOrderItemId()
                        )
                );

        Order order = orderItem.getOrder();

        // Customer can only exchange their own order
        if (!order.getUser().getId().equals(user.getId())) {

            throw new ResourceNotFoundException(
                    "Order item not found with id: "
                            + request.getOrderItemId()
            );
        }

        // Exchange allowed only after completion
        if (order.getStatus() != OrderStatus.DELIVERED
                && order.getStatus() != OrderStatus.PICKED_UP) {

            throw new IllegalArgumentException(
                    "Exchange can only be requested after order completion"
            );
        }

        // Replacement product must exist and be active
        Product replacementProduct =
                productRepository.findByIdAndActiveTrue(
                        request.getReplacementProductId()
                ).orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Replacement product not found with id: "
                                        + request.getReplacementProductId()
                        )
                );

        // Prevent duplicate active exchange request
        if (exchangeRequestRepository
                .existsByOrderItemIdAndStatus(
                        orderItem.getId(),
                        ExchangeStatus.REQUESTED)) {

            throw new IllegalArgumentException(
                    "An exchange request already exists for this order item"
            );
        }

        // Validate quantity
        if (orderItem.getQuantity() <= 0) {

            throw new IllegalArgumentException(
                    "Exchange quantity must be greater than zero"
            );
        }

        ExchangeRequest exchangeRequest =
                new ExchangeRequest();

        exchangeRequest.setUser(user);
        exchangeRequest.setOrder(order);
        exchangeRequest.setOrderItem(orderItem);

        // Exchange entire original quantity
        exchangeRequest.setQuantity(
                orderItem.getQuantity()
        );

        exchangeRequest.setReplacementProduct(
                replacementProduct
        );

        exchangeRequest.setReason(
                request.getReason()
        );

        exchangeRequest.setStatus(
                ExchangeStatus.REQUESTED
        );

        ExchangeRequest savedRequest =
                exchangeRequestRepository.save(
                        exchangeRequest
                );

        // Audit log
        auditLogService.createAuditLog(
                "CREATE_EXCHANGE",
                "EXCHANGE",
                savedRequest.getId(),
                "Exchange requested for order item "
                        + orderItem.getId()
                        + " with replacement product "
                        + replacementProduct.getName()
        );

        return mapToDto(savedRequest);
    }

    // =========================================================
    // GET MY EXCHANGE REQUESTS - CUSTOMER
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<ExchangeRequestDto> getMyExchangeRequests() {

        User user = getAuthenticatedUser();

        return exchangeRequestRepository
                .findByUserIdOrderByRequestedAtDesc(
                        user.getId()
                )
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    // =========================================================
    // GET SINGLE EXCHANGE REQUEST - CUSTOMER
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public ExchangeRequestDto getExchangeRequestById(
            Long id) {

        User user = getAuthenticatedUser();

        ExchangeRequest exchangeRequest =
                exchangeRequestRepository
                        .findByIdAndUserId(
                                id,
                                user.getId()
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Exchange request not found with id: "
                                                + id
                                )
                        );

        return mapToDto(exchangeRequest);
    }

    // =========================================================
    // GET ALL EXCHANGE REQUESTS
    // ADMIN / STAFF / MANAGER
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<ExchangeRequestDto> getAllExchangeRequests() {

        return exchangeRequestRepository
                .findAll()
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    // =========================================================
    // UPDATE EXCHANGE STATUS
    // ADMIN / STAFF / MANAGER
    // =========================================================

    @Override
    @Transactional
    public ExchangeRequestDto updateExchangeStatus(
            Long id,
            ExchangeRequestDto request) {

        ExchangeRequest exchangeRequest =
                exchangeRequestRepository
                        .findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Exchange request not found with id: "
                                                + id
                                )
                        );

        ExchangeStatus currentStatus =
                exchangeRequest.getStatus();

        ExchangeStatus newStatus =
                request.getStatus();

        // Validate status transition
        if (!isValidStatusTransition(
                currentStatus,
                newStatus)) {

            throw new IllegalArgumentException(
                    "Invalid exchange status transition from "
                            + currentStatus
                            + " to "
                            + newStatus
            );
        }

        // =====================================================
        // APPROVED
        // =====================================================

        if (newStatus == ExchangeStatus.APPROVED) {

            exchangeRequest.setStatus(
                    ExchangeStatus.APPROVED
            );

            exchangeRequest.setStaffRemarks(
                    request.getStaffRemarks()
            );

            exchangeRequest.setProcessedAt(
                    LocalDateTime.now()
            );

            ExchangeRequest updatedRequest =
                    exchangeRequestRepository.save(
                            exchangeRequest
                    );

            auditLogService.createAuditLog(
                    "APPROVE_EXCHANGE",
                    "EXCHANGE",
                    updatedRequest.getId(),
                    "Exchange request approved"
            );

            return mapToDto(updatedRequest);
        }

        // =====================================================
        // REJECTED
        // =====================================================

        if (newStatus == ExchangeStatus.REJECTED) {

            exchangeRequest.setStatus(
                    ExchangeStatus.REJECTED
            );

            exchangeRequest.setStaffRemarks(
                    request.getStaffRemarks()
            );

            exchangeRequest.setProcessedAt(
                    LocalDateTime.now()
            );

            ExchangeRequest updatedRequest =
                    exchangeRequestRepository.save(
                            exchangeRequest
                    );

            auditLogService.createAuditLog(
                    "REJECT_EXCHANGE",
                    "EXCHANGE",
                    updatedRequest.getId(),
                    "Exchange request rejected"
            );

            return mapToDto(updatedRequest);
        }

        // =====================================================
        // COMPLETED
        // =====================================================

        if (newStatus == ExchangeStatus.COMPLETED) {

            OrderItem orderItem =
                    exchangeRequest.getOrderItem();

            if (orderItem == null) {

                throw new ResourceNotFoundException(
                        "Order item not found for exchange request"
                );
            }

            int exchangeQuantity =
                    exchangeRequest.getQuantity();

            if (exchangeQuantity <= 0) {

                throw new IllegalArgumentException(
                        "Exchange quantity must be greater than zero"
                );
            }

            // -------------------------------------------------
            // Original product
            // -------------------------------------------------

            Product originalProduct =
                    productRepository
                            .findByIdForUpdate(
                                    orderItem
                                            .getProduct()
                                            .getId()
                            )
                            .orElseThrow(() ->
                                    new ResourceNotFoundException(
                                            "Original product not found"
                                    )
                            );

            // -------------------------------------------------
            // Replacement product
            // -------------------------------------------------

            if (exchangeRequest.getReplacementProduct()
                    == null) {

                throw new ResourceNotFoundException(
                        "Replacement product not found for exchange request"
                );
            }

            Product replacementProduct =
                    productRepository
                            .findByIdForUpdate(
                                    exchangeRequest
                                            .getReplacementProduct()
                                            .getId()
                            )
                            .orElseThrow(() ->
                                    new ResourceNotFoundException(
                                            "Replacement product not found"
                                    )
                            );

            // -------------------------------------------------
            // Prevent exchanging a product with itself
            // -------------------------------------------------

            if (originalProduct.getId()
                    .equals(replacementProduct.getId())) {

                throw new IllegalArgumentException(
                        "Original product and replacement product "
                                + "cannot be the same"
                );
            }

            // -------------------------------------------------
            // Check replacement stock
            // -------------------------------------------------

            if (replacementProduct.getStockQuantity()
                    < exchangeQuantity) {

                throw new IllegalArgumentException(
                        "Insufficient stock for replacement product: "
                                + replacementProduct.getName()
                                + ". Available stock: "
                                + replacementProduct.getStockQuantity()
                                + ", Required: "
                                + exchangeQuantity
                );
            }

            int originalStockBefore =
                    originalProduct.getStockQuantity();

            int replacementStockBefore =
                    replacementProduct.getStockQuantity();

            // -------------------------------------------------
            // Return original product to inventory
            // -------------------------------------------------

            originalProduct.setStockQuantity(
                    originalStockBefore
                            + exchangeQuantity
            );

            // -------------------------------------------------
            // Deduct replacement product
            // -------------------------------------------------

            replacementProduct.setStockQuantity(
                    replacementStockBefore
                            - exchangeQuantity
            );

            // -------------------------------------------------
            // Save inventory
            // -------------------------------------------------

            productRepository.save(
                    originalProduct
            );

            productRepository.save(
                    replacementProduct
            );

            // -------------------------------------------------
            // Complete exchange
            // -------------------------------------------------

            exchangeRequest.setStatus(
                    ExchangeStatus.COMPLETED
            );

            exchangeRequest.setStaffRemarks(
                    request.getStaffRemarks()
            );

            exchangeRequest.setProcessedAt(
                    LocalDateTime.now()
            );

            ExchangeRequest updatedRequest =
                    exchangeRequestRepository.save(
                            exchangeRequest
                    );

            // -------------------------------------------------
            // Audit exchange
            // -------------------------------------------------

            auditLogService.createAuditLog(
                    "COMPLETE_EXCHANGE",
                    "EXCHANGE",
                    updatedRequest.getId(),
                    "Exchange completed. Original product: "
                            + originalProduct.getName()
                            + " stock changed from "
                            + originalStockBefore
                            + " to "
                            + originalProduct.getStockQuantity()
                            + ". Replacement product: "
                            + replacementProduct.getName()
                            + " stock changed from "
                            + replacementStockBefore
                            + " to "
                            + replacementProduct.getStockQuantity()
                            + ". Quantity: "
                            + exchangeQuantity
            );

            return mapToDto(updatedRequest);
        }

        throw new IllegalArgumentException(
                "Unsupported exchange status: "
                        + newStatus
        );
    }

    // =========================================================
    // VALIDATE STATUS TRANSITION
    // =========================================================

    private boolean isValidStatusTransition(
            ExchangeStatus currentStatus,
            ExchangeStatus newStatus) {

        if (currentStatus == null
                || newStatus == null) {

            return false;
        }

        switch (currentStatus) {

            case REQUESTED:

                return newStatus == ExchangeStatus.APPROVED
                        || newStatus == ExchangeStatus.REJECTED;

            case APPROVED:

                return newStatus == ExchangeStatus.COMPLETED;

            case REJECTED:
            case COMPLETED:

                return false;

            default:

                return false;
        }
    }

    // =========================================================
    // GET AUTHENTICATED USER
    // =========================================================

    private User getAuthenticatedUser() {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        if (authentication == null
                || !authentication.isAuthenticated()) {

            throw new IllegalStateException(
                    "User is not authenticated"
            );
        }

        Object principal =
                authentication.getPrincipal();

        if (!(principal instanceof CustomUserDetails)) {

            throw new IllegalStateException(
                    "Invalid authenticated user"
            );
        }

        CustomUserDetails userDetails =
                (CustomUserDetails) principal;

        return userRepository
                .findById(
                        userDetails.getUserId()
                )
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found"
                        )
                );
    }

    // =========================================================
    // ENTITY -> DTO
    // =========================================================

    private ExchangeRequestDto mapToDto(
            ExchangeRequest exchangeRequest) {

        ExchangeRequestDto dto =
                new ExchangeRequestDto();

        dto.setId(
                exchangeRequest.getId()
        );

        dto.setOrderItemId(
                exchangeRequest
                        .getOrderItem()
                        .getId()
        );

        if (exchangeRequest.getReplacementProduct()
                != null) {

            dto.setReplacementProductId(
                    exchangeRequest
                            .getReplacementProduct()
                            .getId()
            );
        }

        dto.setQuantity(
                exchangeRequest.getQuantity()
        );

        dto.setReason(
                exchangeRequest.getReason()
        );

        dto.setStatus(
                exchangeRequest.getStatus()
        );

        dto.setRequestedAt(
                exchangeRequest.getRequestedAt()
        );

        dto.setProcessedAt(
                exchangeRequest.getProcessedAt()
        );

        dto.setStaffRemarks(
                exchangeRequest.getStaffRemarks()
        );

        return dto;
    }
}