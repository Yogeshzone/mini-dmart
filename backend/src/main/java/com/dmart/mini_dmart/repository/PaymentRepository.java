package com.dmart.mini_dmart.repository;

import com.dmart.mini_dmart.entity.Payment;
import com.dmart.mini_dmart.entity.PaymentStatus;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PaymentRepository
        extends JpaRepository<Payment, Long> {

    Optional<Payment> findByOrderId(Long orderId);

    Optional<Payment> findByTransactionId(
            String transactionId
    );

    boolean existsByOrderId(Long orderId);

    List<Payment> findByStatusOrderByCreatedAtDesc(
            PaymentStatus status
    );
}