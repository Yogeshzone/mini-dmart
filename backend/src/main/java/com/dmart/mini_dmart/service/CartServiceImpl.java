package com.dmart.mini_dmart.service;

import com.dmart.mini_dmart.dto.AddToCartRequest;
import com.dmart.mini_dmart.dto.CartItemResponse;
import com.dmart.mini_dmart.dto.CartResponse;
import com.dmart.mini_dmart.dto.UpdateCartItemRequest;
import com.dmart.mini_dmart.entity.Cart;
import com.dmart.mini_dmart.entity.CartItem;
import com.dmart.mini_dmart.entity.Product;
import com.dmart.mini_dmart.entity.User;
import com.dmart.mini_dmart.exception.ResourceNotFoundException;
import com.dmart.mini_dmart.repository.CartItemRepository;
import com.dmart.mini_dmart.repository.CartRepository;
import com.dmart.mini_dmart.repository.ProductRepository;
import com.dmart.mini_dmart.repository.UserRepository;
import com.dmart.mini_dmart.security.CustomUserDetails;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;

@Service
public class CartServiceImpl implements CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public CartServiceImpl(
            CartRepository cartRepository,
            CartItemRepository cartItemRepository,
            ProductRepository productRepository,
            UserRepository userRepository) {

        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public CartResponse getMyCart() {

        Cart cart = getAuthenticatedUserCart();

        return mapToCartResponse(cart);
    }

    @Override
    @Transactional
    public CartResponse addToCart(AddToCartRequest request) {

        Cart cart = getAuthenticatedUserCart();

        Product product =
                productRepository.findByIdAndActiveTrue(
                        request.getProductId()
                ).orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Product not found with id: "
                                        + request.getProductId()
                        )
                );

        if (request.getQuantity() <= 0) {

            throw new IllegalArgumentException(
                    "Quantity must be greater than zero"
            );
        }

        if (product.getStockQuantity() < request.getQuantity()) {

            throw new IllegalArgumentException(
                    "Insufficient stock. Available stock: "
                            + product.getStockQuantity()
            );
        }

        CartItem cartItem =
                cartItemRepository
                        .findByCartIdAndProductId(
                                cart.getId(),
                                product.getId()
                        )
                        .orElse(null);

        if (cartItem != null) {

            int newQuantity =
                    cartItem.getQuantity()
                            + request.getQuantity();

            if (newQuantity > product.getStockQuantity()) {

                throw new IllegalArgumentException(
                        "Requested quantity exceeds available stock. "
                                + "Available stock: "
                                + product.getStockQuantity()
                );
            }

            cartItem.setQuantity(newQuantity);

        } else {

            cartItem = new CartItem();

            cartItem.setCart(cart);
            cartItem.setProduct(product);
            cartItem.setQuantity(request.getQuantity());
        }

        cartItemRepository.save(cartItem);

        return mapToCartResponse(cart);
    }

    @Override
    @Transactional
    public CartResponse updateCartItem(
            Long productId,
            UpdateCartItemRequest request) {

        Cart cart = getAuthenticatedUserCart();

        CartItem cartItem =
                cartItemRepository
                        .findByCartIdAndProductId(
                                cart.getId(),
                                productId
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Product is not present in cart"
                                )
                        );

        Product product =
                productRepository.findByIdAndActiveTrue(productId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Product not found with id: "
                                                + productId
                                )
                        );

        if (request.getQuantity() <= 0) {

            throw new IllegalArgumentException(
                    "Quantity must be greater than zero"
            );
        }

        if (request.getQuantity()
                > product.getStockQuantity()) {

            throw new IllegalArgumentException(
                    "Requested quantity exceeds available stock. "
                            + "Available stock: "
                            + product.getStockQuantity()
            );
        }

        cartItem.setQuantity(request.getQuantity());

        cartItemRepository.save(cartItem);

        return mapToCartResponse(cart);
    }

    @Override
    @Transactional
    public void removeCartItem(Long productId) {

        Cart cart = getAuthenticatedUserCart();

        CartItem cartItem =
                cartItemRepository
                        .findByCartIdAndProductId(
                                cart.getId(),
                                productId
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Product is not present in cart"
                                )
                        );

        cartItemRepository.delete(cartItem);
    }

    @Override
    @Transactional
    public void clearCart() {

        Cart cart = getAuthenticatedUserCart();

        cartItemRepository.deleteByCartId(cart.getId());
    }

    private Cart getAuthenticatedUserCart() {

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

        User user =
                userRepository.findById(
                        userDetails.getUserId()
                ).orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found"
                        )
                );

        return cartRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    Cart newCart = new Cart();
                    newCart.setUser(user);
                    return cartRepository.save(newCart);
                });
    }

    private CartResponse mapToCartResponse(Cart cart) {

        CartResponse response = new CartResponse();

        response.setCartId(cart.getId());

        if (cart.getItems() == null) {

            response.setItems(new ArrayList<>());
            response.setSubtotal(BigDecimal.ZERO);
            response.setTotalItems(0);

            return response;
        }

        BigDecimal subtotal = BigDecimal.ZERO;
        int totalItems = 0;

        for (CartItem item : cart.getItems()) {

            Product product = item.getProduct();

            BigDecimal unitPrice =
                    product.getPrice();

            BigDecimal itemSubtotal =
                    unitPrice.multiply(
                            BigDecimal.valueOf(
                                    item.getQuantity()
                            )
                    );

            CartItemResponse itemResponse =
                    new CartItemResponse();

            itemResponse.setId(item.getId());
            itemResponse.setProductId(product.getId());
            itemResponse.setProductName(product.getName());
            itemResponse.setImageUrl(product.getImageUrl());
            itemResponse.setUnitPrice(unitPrice);
            itemResponse.setQuantity(item.getQuantity());
            itemResponse.setSubtotal(itemSubtotal);
            itemResponse.setAvailableStock(
                    product.getStockQuantity()
            );

            response.getItems().add(itemResponse);

            subtotal = subtotal.add(itemSubtotal);

            totalItems += item.getQuantity();
        }

        response.setSubtotal(subtotal);
        response.setTotalItems(totalItems);

        return response;
    }
}