package com.dmart.mini_dmart.service;

import com.dmart.mini_dmart.dto.CreatePaymentRequest;
import com.dmart.mini_dmart.dto.PaymentResponse;

import java.util.List;

public interface PaymentService {

    PaymentResponse createPayment(
            CreatePaymentRequest request
    );

    PaymentResponse getPaymentById(
            Long id
    );

    PaymentResponse getPaymentByOrderId(
            Long orderId
    );

    List<PaymentResponse> getMyPayments();

    List<PaymentResponse> getAllPayments();

    PaymentResponse updatePaymentStatus(
            Long id,
            String status
    );
}