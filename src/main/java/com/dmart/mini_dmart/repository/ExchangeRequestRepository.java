package com.dmart.mini_dmart.repository;

import com.dmart.mini_dmart.entity.ExchangeRequest;
import com.dmart.mini_dmart.entity.ExchangeStatus;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ExchangeRequestRepository
        extends JpaRepository<ExchangeRequest, Long> {

    boolean existsByOrderItemIdAndStatus(
            Long orderItemId,
            ExchangeStatus status
    );

    List<ExchangeRequest> findByUserIdOrderByRequestedAtDesc(
            Long userId
    );

    Optional<ExchangeRequest> findByIdAndUserId(
            Long id,
            Long userId
    );
}