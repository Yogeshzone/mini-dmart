package com.dmart.mini_dmart.service;

import com.dmart.mini_dmart.dto.CreatePaymentRequest;
import com.dmart.mini_dmart.dto.PaymentResponse;
import com.dmart.mini_dmart.entity.Order;
import com.dmart.mini_dmart.entity.OrderStatus;
import com.dmart.mini_dmart.entity.Payment;
import com.dmart.mini_dmart.entity.PaymentStatus;
import com.dmart.mini_dmart.entity.User;
import com.dmart.mini_dmart.exception.ResourceNotFoundException;
import com.dmart.mini_dmart.repository.OrderRepository;
import com.dmart.mini_dmart.repository.PaymentRepository;
import com.dmart.mini_dmart.repository.UserRepository;
import com.dmart.mini_dmart.security.CustomUserDetails;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;

    public PaymentServiceImpl(
            PaymentRepository paymentRepository,
            OrderRepository orderRepository,
            UserRepository userRepository) {

        this.paymentRepository = paymentRepository;
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional
    public PaymentResponse createPayment(
            CreatePaymentRequest request) {

        User user = getAuthenticatedUser();

        Order order =
                orderRepository.findById(
                        request.getOrderId()
                ).orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Order not found with id: "
                                        + request.getOrderId()
                        )
                );

        // Customer can pay only for their own order
        if (!order.getUser().getId()
                .equals(user.getId())) {

            throw new ResourceNotFoundException(
                    "Order not found with id: "
                            + request.getOrderId()
            );
        }

        // Prevent duplicate payment
        if (paymentRepository
                .existsByOrderId(order.getId())) {

            throw new IllegalArgumentException(
                    "Payment already exists for this order"
            );
        }

        // Only valid orders should be paid
        if (order.getStatus() == OrderStatus.CANCELLED) {

            throw new IllegalArgumentException(
                    "Cannot make payment for a cancelled order"
            );
        }

        Payment payment = new Payment();

        payment.setOrder(order);

        payment.setTransactionId(
                generateTransactionId()
        );

        payment.setAmount(
                order.getTotalAmount()
        );

        payment.setStatus(
                PaymentStatus.PENDING
        );

        Payment savedPayment =
                paymentRepository.save(payment);

        return mapToResponse(savedPayment);
    }

    @Override
    @Transactional(readOnly = true)
    public PaymentResponse getPaymentById(Long id) {

        User user = getAuthenticatedUser();

        Payment payment =
                paymentRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Payment not found with id: "
                                                + id
                                )
                        );

        if (!payment.getOrder()
                .getUser()
                .getId()
                .equals(user.getId())) {

            throw new ResourceNotFoundException(
                    "Payment not found with id: " + id
            );
        }

        return mapToResponse(payment);
    }

    @Override
    @Transactional(readOnly = true)
    public PaymentResponse getPaymentByOrderId(
            Long orderId) {

        User user = getAuthenticatedUser();

        Payment payment =
                paymentRepository
                        .findByOrderId(orderId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Payment not found for order: "
                                                + orderId
                                )
                        );

        if (!payment.getOrder()
                .getUser()
                .getId()
                .equals(user.getId())) {

            throw new ResourceNotFoundException(
                    "Payment not found for order: "
                            + orderId
            );
        }

        return mapToResponse(payment);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PaymentResponse> getMyPayments() {

        User user = getAuthenticatedUser();

        return paymentRepository
                .findAll()
                .stream()
                .filter(payment ->
                        payment.getOrder()
                                .getUser()
                                .getId()
                                .equals(user.getId())
                )
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<PaymentResponse> getAllPayments() {

        return paymentRepository
                .findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public PaymentResponse updatePaymentStatus(
            Long id,
            String status) {

        Payment payment =
                paymentRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Payment not found with id: "
                                                + id
                                )
                        );

        PaymentStatus newStatus;

        try {
            newStatus =
                    PaymentStatus.valueOf(
                            status.toUpperCase()
                    );
        } catch (IllegalArgumentException ex) {

            throw new IllegalArgumentException(
                    "Invalid payment status: " + status
            );
        }

        PaymentStatus currentStatus =
                payment.getStatus();

        if (!isValidStatusTransition(
                currentStatus,
                newStatus)) {

            throw new IllegalArgumentException(
                    "Invalid payment status transition from "
                            + currentStatus
                            + " to "
                            + newStatus
            );
        }

        payment.setStatus(newStatus);

        Payment updatedPayment =
                paymentRepository.save(payment);

        return mapToResponse(updatedPayment);
    }

    private boolean isValidStatusTransition(
            PaymentStatus currentStatus,
            PaymentStatus newStatus) {

        if (currentStatus == null
                || newStatus == null) {

            return false;
        }

        switch (currentStatus) {

            case PENDING:
                return newStatus == PaymentStatus.SUCCESS
                        || newStatus == PaymentStatus.FAILED;

            case SUCCESS:
                return newStatus == PaymentStatus.REFUNDED;

            case FAILED:
                return false;

            case REFUNDED:
                return false;

            default:
                return false;
        }
    }

    private String generateTransactionId() {

        return "TXN-"
                + UUID.randomUUID()
                .toString()
                .substring(0, 8)
                .toUpperCase();
    }

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

    private PaymentResponse mapToResponse(
            Payment payment) {

        PaymentResponse response =
                new PaymentResponse();

        response.setId(
                payment.getId()
        );

        response.setOrderId(
                payment.getOrder().getId()
        );

        response.setOrderNumber(
                payment.getOrder().getOrderNumber()
        );

        response.setTransactionId(
                payment.getTransactionId()
        );

        response.setAmount(
                payment.getAmount()
        );

        response.setStatus(
                payment.getStatus()
        );

        response.setCreatedAt(
                payment.getCreatedAt()
        );

        response.setUpdatedAt(
                payment.getUpdatedAt()
        );

        return response;
    }
}