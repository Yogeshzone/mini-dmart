package com.dmart.mini_dmart.controller;

import com.dmart.mini_dmart.dto.CreatePaymentRequest;
import com.dmart.mini_dmart.dto.PaymentResponse;
import com.dmart.mini_dmart.service.PaymentService;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(
            PaymentService paymentService) {

        this.paymentService = paymentService;
    }

    // =========================================================
    // CUSTOMER - CREATE PAYMENT
    // =========================================================

    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<PaymentResponse> createPayment(
            @Valid @RequestBody CreatePaymentRequest request) {

        return ResponseEntity.ok(
                paymentService.createPayment(request)
        );
    }

    // =========================================================
    // ADMIN / STAFF / MANAGER - GET ALL PAYMENTS
    // =========================================================

    @GetMapping("/admin")
    @PreAuthorize(
            "hasAnyRole('ADMIN', 'STAFF', 'MANAGER')"
    )
    public ResponseEntity<List<PaymentResponse>> getAllPayments() {

        return ResponseEntity.ok(
                paymentService.getAllPayments()
        );
    }

    // =========================================================
    // CUSTOMER - GET PAYMENT BY ID
    // =========================================================

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<PaymentResponse> getPaymentById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                paymentService.getPaymentById(id)
        );
    }

    // =========================================================
    // CUSTOMER - GET PAYMENT BY ORDER
    // =========================================================

    @GetMapping("/order/{orderId}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<PaymentResponse> getPaymentByOrderId(
            @PathVariable Long orderId) {

        return ResponseEntity.ok(
                paymentService.getPaymentByOrderId(
                        orderId
                )
        );
    }

    // =========================================================
    // CUSTOMER - GET MY PAYMENTS
    // =========================================================

    @GetMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<List<PaymentResponse>> getMyPayments() {

        return ResponseEntity.ok(
                paymentService.getMyPayments()
        );
    }

    // =========================================================
    // ADMIN / STAFF / MANAGER - UPDATE PAYMENT STATUS
    // =========================================================

    @PutMapping("/{id}/status")
    @PreAuthorize(
            "hasAnyRole('ADMIN', 'STAFF', 'MANAGER')"
    )
    public ResponseEntity<PaymentResponse> updatePaymentStatus(
            @PathVariable Long id,
            @RequestParam String status) {

        return ResponseEntity.ok(
                paymentService.updatePaymentStatus(
                        id,
                        status
                )
        );
    }
}