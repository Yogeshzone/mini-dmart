package com.dmart.mini_dmart.service;

import com.dmart.mini_dmart.dto.AddToCartRequest;
import com.dmart.mini_dmart.dto.CartResponse;
import com.dmart.mini_dmart.dto.UpdateCartItemRequest;

public interface CartService {

    CartResponse getMyCart();

    CartResponse addToCart(AddToCartRequest request);

    CartResponse updateCartItem(
            Long productId,
            UpdateCartItemRequest request
    );

    void removeCartItem(Long productId);

    void clearCart();
}