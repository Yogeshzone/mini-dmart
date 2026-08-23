package com.dmart.mini_dmart.service;

import com.dmart.mini_dmart.dto.ReturnRequestDto;
import com.dmart.mini_dmart.entity.Order;
import com.dmart.mini_dmart.entity.OrderItem;
import com.dmart.mini_dmart.entity.OrderStatus;
import com.dmart.mini_dmart.entity.Product;
import com.dmart.mini_dmart.entity.ReturnRequest;
import com.dmart.mini_dmart.entity.ReturnStatus;
import com.dmart.mini_dmart.entity.User;
import com.dmart.mini_dmart.exception.ResourceNotFoundException;
import com.dmart.mini_dmart.repository.OrderItemRepository;
import com.dmart.mini_dmart.repository.ProductRepository;
import com.dmart.mini_dmart.repository.ReturnRequestRepository;
import com.dmart.mini_dmart.repository.UserRepository;
import com.dmart.mini_dmart.security.CustomUserDetails;
import com.dmart.mini_dmart.dto.UpdateReturnStatusRequest;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReturnServiceImpl implements ReturnService {

    private final ReturnRequestRepository returnRequestRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public ReturnServiceImpl(
            ReturnRequestRepository returnRequestRepository,
            OrderItemRepository orderItemRepository,
            ProductRepository productRepository,
            UserRepository userRepository) {

        this.returnRequestRepository = returnRequestRepository;
        this.orderItemRepository = orderItemRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    // =========================================================
    // CREATE RETURN REQUEST - CUSTOMER
    // =========================================================

    @Override
    @Transactional
    public ReturnRequestDto createReturnRequest(
            ReturnRequestDto request) {

        User user = getAuthenticatedUser();

        // -----------------------------------------------------
        // Find order item
        // -----------------------------------------------------

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

        // -----------------------------------------------------
        // Customer can only return their own order
        // -----------------------------------------------------

        if (!order.getUser().getId().equals(user.getId())) {

            throw new ResourceNotFoundException(
                    "Order item not found with id: "
                            + request.getOrderItemId()
            );
        }

        // -----------------------------------------------------
        // Return allowed only after order completion
        // -----------------------------------------------------

        if (order.getStatus() != OrderStatus.DELIVERED
                && order.getStatus() != OrderStatus.PICKED_UP) {

            throw new IllegalArgumentException(
                    "Return can only be requested after order completion"
            );
        }

        // -----------------------------------------------------
        // Prevent duplicate active return request
        // -----------------------------------------------------

        if (returnRequestRepository
                .existsByOrderItemIdAndStatus(
                        orderItem.getId(),
                        ReturnStatus.REQUESTED)) {

            throw new IllegalArgumentException(
                    "A return request already exists for this order item"
            );
        }

        // -----------------------------------------------------
        // Create return request
        // -----------------------------------------------------

        ReturnRequest returnRequest =
                new ReturnRequest();

        returnRequest.setUser(user);
        returnRequest.setOrder(order);
        returnRequest.setOrderItem(orderItem);
        returnRequest.setReason(request.getReason());
        returnRequest.setStatus(ReturnStatus.REQUESTED);

        // -----------------------------------------------------
        // Save
        // -----------------------------------------------------

        ReturnRequest savedRequest =
                returnRequestRepository.save(
                        returnRequest
                );

        return mapToDto(savedRequest);
    }

    // =========================================================
    // GET MY RETURN REQUESTS - CUSTOMER
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<ReturnRequestDto> getMyReturnRequests() {

        User user = getAuthenticatedUser();

        return returnRequestRepository
                .findByUserIdOrderByRequestedAtDesc(
                        user.getId()
                )
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    // =========================================================
    // GET SINGLE RETURN REQUEST - CUSTOMER
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public ReturnRequestDto getReturnRequestById(
            Long id) {

        User user = getAuthenticatedUser();

        ReturnRequest returnRequest =
                returnRequestRepository
                        .findByIdAndUserId(
                                id,
                                user.getId()
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Return request not found with id: "
                                                + id
                                )
                        );

        return mapToDto(returnRequest);
    }

    // =========================================================
    // GET ALL RETURN REQUESTS - ADMIN / STAFF / MANAGER
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<ReturnRequestDto> getAllReturnRequests() {

        return returnRequestRepository
                .findAll()
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    // =========================================================
    // UPDATE RETURN STATUS
    // ADMIN / STAFF / MANAGER
    // =========================================================

    @Override
    @Transactional
    public ReturnRequestDto updateReturnStatus(
            Long id,
            UpdateReturnStatusRequest request) {

        ReturnRequest returnRequest =
                returnRequestRepository
                        .findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Return request not found with id: "
                                                + id
                                )
                        );

        ReturnStatus currentStatus =
                returnRequest.getStatus();

        ReturnStatus newStatus =
                request.getStatus();

        // -----------------------------------------------------
        // Validate status transition
        // -----------------------------------------------------

        if (!isValidStatusTransition(
                currentStatus,
                newStatus)) {

            throw new IllegalArgumentException(
                    "Invalid return status transition from "
                            + currentStatus
                            + " to "
                            + newStatus
            );
        }

        // -----------------------------------------------------
        // Restore inventory ONLY when return is COMPLETED
        // -----------------------------------------------------

        if (newStatus == ReturnStatus.COMPLETED) {

            OrderItem orderItem =
                    returnRequest.getOrderItem();

            if (orderItem == null) {

                throw new ResourceNotFoundException(
                        "Order item not found for return request"
                );
            }

            Long productId =
                    orderItem.getProduct().getId();

            // Lock product row while updating stock
            Product product =
                    productRepository
                            .findByIdForUpdate(productId)
                            .orElseThrow(() ->
                                    new ResourceNotFoundException(
                                            "Product not found with id: "
                                                    + productId
                                    )
                            );

            int returnedQuantity =
                    orderItem.getQuantity();

            if (returnedQuantity <= 0) {

                throw new IllegalArgumentException(
                        "Returned quantity must be greater than zero"
                );
            }

            // Restore returned quantity to inventory
            product.setStockQuantity(
                    product.getStockQuantity()
                            + returnedQuantity
            );

            productRepository.save(product);
        }

        // -----------------------------------------------------
        // Update return status
        // -----------------------------------------------------

        returnRequest.setStatus(newStatus);

        // -----------------------------------------------------
        // Update staff remarks
        // -----------------------------------------------------

        returnRequest.setStaffRemarks(
                request.getStaffRemarks()
        );

        // -----------------------------------------------------
        // Set processed time
        // -----------------------------------------------------

        returnRequest.setProcessedAt(
                LocalDateTime.now()
        );

        // -----------------------------------------------------
        // Save return request
        // -----------------------------------------------------

        ReturnRequest updatedRequest =
                returnRequestRepository.save(
                        returnRequest
                );

        return mapToDto(updatedRequest);
    }

    // =========================================================
    // VALIDATE RETURN STATUS TRANSITION
    // =========================================================

    private boolean isValidStatusTransition(
            ReturnStatus currentStatus,
            ReturnStatus newStatus) {

        if (currentStatus == null
                || newStatus == null) {

            return false;
        }

        switch (currentStatus) {

            case REQUESTED:

                return newStatus == ReturnStatus.APPROVED
                        || newStatus == ReturnStatus.REJECTED;

            case APPROVED:

                return newStatus == ReturnStatus.COMPLETED;

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

    private ReturnRequestDto mapToDto(
            ReturnRequest returnRequest) {

        ReturnRequestDto dto =
                new ReturnRequestDto();

        dto.setId(
                returnRequest.getId()
        );

        dto.setOrderItemId(
                returnRequest
                        .getOrderItem()
                        .getId()
        );

        dto.setReason(
                returnRequest.getReason()
        );

        dto.setStatus(
                returnRequest.getStatus()
        );

        dto.setRequestedAt(
                returnRequest.getRequestedAt()
        );

        dto.setProcessedAt(
                returnRequest.getProcessedAt()
        );

        dto.setStaffRemarks(
                returnRequest.getStaffRemarks()
        );

        return dto;
    }
}