package com.dmart.mini_dmart.service;

import com.dmart.mini_dmart.dto.ReviewRequest;
import com.dmart.mini_dmart.dto.ReviewResponse;
import com.dmart.mini_dmart.entity.Product;
import com.dmart.mini_dmart.entity.Review;
import com.dmart.mini_dmart.entity.ReviewStatus;
import com.dmart.mini_dmart.entity.User;
import com.dmart.mini_dmart.exception.ResourceNotFoundException;
import com.dmart.mini_dmart.repository.ProductRepository;
import com.dmart.mini_dmart.repository.ReviewRepository;
import com.dmart.mini_dmart.repository.UserRepository;
import com.dmart.mini_dmart.security.CustomUserDetails;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public ReviewServiceImpl(
            ReviewRepository reviewRepository,
            ProductRepository productRepository,
            UserRepository userRepository) {

        this.reviewRepository = reviewRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional
    public ReviewResponse createReview(
            ReviewRequest request) {

        User user = getAuthenticatedUser();

        Product product =
                productRepository.findById(
                        request.getProductId()
                ).orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Product not found with id: "
                                        + request.getProductId()
                        )
                );

        if (reviewRepository.existsByUserIdAndProductId(
                user.getId(),
                product.getId())) {

            throw new IllegalArgumentException(
                    "You have already reviewed this product"
            );
        }

        Review review = new Review();

        review.setUser(user);
        review.setProduct(product);
        review.setRating(request.getRating());
        review.setComment(request.getComment());
        review.setStatus(ReviewStatus.PENDING);

        Review savedReview =
                reviewRepository.save(review);

        return mapToResponse(savedReview);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReviewResponse> getMyReviews() {

        User user = getAuthenticatedUser();

        return reviewRepository
                .findByUserIdOrderByCreatedAtDesc(
                        user.getId()
                )
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ReviewResponse getMyReviewById(
            Long id) {

        User user = getAuthenticatedUser();

        Review review =
                reviewRepository
                        .findByIdAndUserId(
                                id,
                                user.getId()
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Review not found with id: "
                                                + id
                                )
                        );

        return mapToResponse(review);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReviewResponse> getProductReviews(
            Long productId) {

        productRepository.findById(productId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Product not found with id: "
                                        + productId
                        )
                );

        return reviewRepository
                .findByProductIdAndStatusOrderByCreatedAtDesc(
                        productId,
                        ReviewStatus.APPROVED
                )
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReviewResponse> getAllReviews() {

        return reviewRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ReviewResponse updateReviewStatus(
            Long id,
            String status) {

        Review review =
                reviewRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Review not found with id: "
                                                + id
                                )
                        );

        ReviewStatus newStatus;

        try {

            newStatus =
                    ReviewStatus.valueOf(
                            status.toUpperCase()
                    );

        } catch (IllegalArgumentException ex) {

            throw new IllegalArgumentException(
                    "Invalid review status: "
                            + status
            );
        }

        if (review.getStatus() == ReviewStatus.REJECTED
                && newStatus == ReviewStatus.APPROVED) {

            throw new IllegalArgumentException(
                    "Rejected review cannot be approved"
            );
        }

        review.setStatus(newStatus);

        Review updatedReview =
                reviewRepository.save(review);

        return mapToResponse(updatedReview);
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

    private ReviewResponse mapToResponse(
            Review review) {

        ReviewResponse response =
                new ReviewResponse();

        response.setId(review.getId());

        response.setProductId(
                review.getProduct().getId()
        );

        response.setProductName(
                review.getProduct().getName()
        );

        response.setUserId(
                review.getUser().getId()
        );

        response.setUserName(
                review.getUser().getFullName()
        );

        response.setRating(
                review.getRating()
        );

        response.setComment(
                review.getComment()
        );

        response.setStatus(
                review.getStatus()
        );

        response.setCreatedAt(
                review.getCreatedAt()
        );

        response.setUpdatedAt(
                review.getUpdatedAt()
        );

        return response;
    }
}