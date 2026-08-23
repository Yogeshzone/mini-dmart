package com.dmart.mini_dmart.controller;

import com.dmart.mini_dmart.dto.ReviewRequest;
import com.dmart.mini_dmart.dto.ReviewResponse;
import com.dmart.mini_dmart.service.ReviewService;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(
            ReviewService reviewService) {

        this.reviewService = reviewService;
    }

    // Customer creates a review
    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ReviewResponse> createReview(
            @Valid @RequestBody ReviewRequest request) {

        return ResponseEntity.ok(
                reviewService.createReview(request)
        );
    }

    // Customer views their reviews
    @GetMapping("/my")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<List<ReviewResponse>> getMyReviews() {

        return ResponseEntity.ok(
                reviewService.getMyReviews()
        );
    }

    // Customer views one of their reviews
    @GetMapping("/my/{id}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ReviewResponse> getMyReviewById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                reviewService.getMyReviewById(id)
        );
    }

    // Anyone authenticated can view approved reviews
    @GetMapping("/product/{productId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<ReviewResponse>> getProductReviews(
            @PathVariable Long productId) {

        return ResponseEntity.ok(
                reviewService.getProductReviews(
                        productId
                )
        );
    }

    // Admin/Staff/Manager views all reviews
    @GetMapping("/admin")
    @PreAuthorize(
            "hasAnyRole('ADMIN', 'STAFF', 'MANAGER')"
    )
    public ResponseEntity<List<ReviewResponse>> getAllReviews() {

        return ResponseEntity.ok(
                reviewService.getAllReviews()
        );
    }

    // Admin/Staff/Manager approves/rejects review
    @PutMapping("/{id}/status")
    @PreAuthorize(
            "hasAnyRole('ADMIN', 'STAFF', 'MANAGER')"
    )
    public ResponseEntity<ReviewResponse> updateReviewStatus(
            @PathVariable Long id,
            @RequestParam String status) {

        return ResponseEntity.ok(
                reviewService.updateReviewStatus(
                        id,
                        status
                )
        );
    }
}