package com.dmart.mini_dmart.repository;

import com.dmart.mini_dmart.entity.Review;
import com.dmart.mini_dmart.entity.ReviewStatus;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ReviewRepository
        extends JpaRepository<Review, Long> {

    List<Review> findByUserIdOrderByCreatedAtDesc(
            Long userId
    );

    List<Review> findByProductIdAndStatusOrderByCreatedAtDesc(
            Long productId,
            ReviewStatus status
    );

    List<Review> findByStatusOrderByCreatedAtAsc(
            ReviewStatus status
    );

    Optional<Review> findByIdAndUserId(
            Long id,
            Long userId
    );

    boolean existsByUserIdAndProductId(
            Long userId,
            Long productId
    );
}