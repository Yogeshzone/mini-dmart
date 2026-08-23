package com.dmart.mini_dmart.repository;

import com.dmart.mini_dmart.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {

    Optional<CartItem> findByCartIdAndProductId(
            Long cartId,
            Long productId
    );

    boolean existsByCartIdAndProductId(
            Long cartId,
            Long productId
    );

    void deleteByCartId(Long cartId);
}