package com.dmart.mini_dmart.repository;

import com.dmart.mini_dmart.entity.ReturnRequest;
import com.dmart.mini_dmart.entity.ReturnStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ReturnRequestRepository
        extends JpaRepository<ReturnRequest, Long> {

    List<ReturnRequest> findByUserIdOrderByRequestedAtDesc(
            Long userId
    );

    List<ReturnRequest> findByStatusOrderByRequestedAtAsc(
            ReturnStatus status
    );

    Optional<ReturnRequest> findByIdAndUserId(
            Long id,
            Long userId
    );

    boolean existsByOrderItemIdAndStatus(
            Long orderItemId,
            ReturnStatus status
    );
}