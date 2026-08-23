package com.dmart.mini_dmart.service;

import com.dmart.mini_dmart.dto.ReviewRequest;
import com.dmart.mini_dmart.dto.ReviewResponse;

import java.util.List;

public interface ReviewService {

    ReviewResponse createReview(
            ReviewRequest request
    );

    List<ReviewResponse> getMyReviews();

    ReviewResponse getMyReviewById(
            Long id
    );

    List<ReviewResponse> getProductReviews(
            Long productId
    );

    List<ReviewResponse> getAllReviews();

    ReviewResponse updateReviewStatus(
            Long id,
            String status
    );
}