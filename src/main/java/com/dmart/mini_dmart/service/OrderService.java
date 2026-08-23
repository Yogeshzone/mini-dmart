package com.dmart.mini_dmart.service;

import com.dmart.mini_dmart.dto.CreateOrderRequest;
import com.dmart.mini_dmart.dto.OrderResponse;
import com.dmart.mini_dmart.dto.UpdateOrderStatusRequest;

import java.util.List;

public interface OrderService {

    OrderResponse createOrder(CreateOrderRequest request);

    OrderResponse getOrderById(Long id);

    List<OrderResponse> getMyOrders();

    List<OrderResponse> getAllOrders();

    OrderResponse cancelOrder(Long id);

    OrderResponse updateOrderStatus(
            Long orderId,
            UpdateOrderStatusRequest request
    );
}