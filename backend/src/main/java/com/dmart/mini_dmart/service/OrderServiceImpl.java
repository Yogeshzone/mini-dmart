package com.dmart.mini_dmart.service;

import com.dmart.mini_dmart.dto.CreateOrderRequest;
import com.dmart.mini_dmart.dto.OrderItemResponse;
import com.dmart.mini_dmart.dto.OrderResponse;
import com.dmart.mini_dmart.dto.UpdateOrderStatusRequest;

import com.dmart.mini_dmart.entity.Cart;
import com.dmart.mini_dmart.entity.CartItem;
import com.dmart.mini_dmart.entity.FulfillmentType;
import com.dmart.mini_dmart.entity.Order;
import com.dmart.mini_dmart.entity.OrderItem;
import com.dmart.mini_dmart.entity.OrderStatus;
import com.dmart.mini_dmart.entity.PickupSlot;
import com.dmart.mini_dmart.entity.Product;
import com.dmart.mini_dmart.entity.User;

import com.dmart.mini_dmart.exception.ResourceNotFoundException;

import com.dmart.mini_dmart.repository.CartItemRepository;
import com.dmart.mini_dmart.repository.CartRepository;
import com.dmart.mini_dmart.repository.OrderRepository;
import com.dmart.mini_dmart.repository.PickupSlotRepository;
import com.dmart.mini_dmart.repository.ProductRepository;
import com.dmart.mini_dmart.repository.UserRepository;

import com.dmart.mini_dmart.security.CustomUserDetails;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final PickupSlotRepository pickupSlotRepository;
    private final AuditLogService auditLogService;

    public OrderServiceImpl(
            OrderRepository orderRepository,
            CartRepository cartRepository,
            CartItemRepository cartItemRepository,
            ProductRepository productRepository,
            UserRepository userRepository,
            PickupSlotRepository pickupSlotRepository,
            AuditLogService auditLogService) {

        this.orderRepository = orderRepository;
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.pickupSlotRepository = pickupSlotRepository;
        this.auditLogService = auditLogService;
    }

    // =========================================================
    // CREATE ORDER - CUSTOMER
    // =========================================================

    @Override
    @Transactional
    public OrderResponse createOrder(CreateOrderRequest request) {

        User user = getAuthenticatedUser();

        Cart cart =
                cartRepository.findByUserId(user.getId())
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Cart not found for user"
                                )
                        );

        if (cart.getItems() == null
                || cart.getItems().isEmpty()) {

            throw new IllegalArgumentException(
                    "Cannot place order with an empty cart"
            );
        }

        // -----------------------------------------------------
        // Validate fulfillment details
        // -----------------------------------------------------

        PickupSlot pickupSlot = null;

        if (request.getFulfillmentType()
                == FulfillmentType.HOME_DELIVERY) {

            if (request.getDeliveryAddress() == null
                    || request.getDeliveryAddress()
                    .trim()
                    .isEmpty()) {

                throw new IllegalArgumentException(
                        "Delivery address is required for home delivery"
                );
            }

        } else if (request.getFulfillmentType()
                == FulfillmentType.STORE_PICKUP) {

            if (request.getPickupSlotId() == null) {

                throw new IllegalArgumentException(
                        "Pickup slot is required for store pickup"
                );
            }

            pickupSlot =
                    pickupSlotRepository.findById(
                            request.getPickupSlotId()
                    ).orElseThrow(() ->
                            new ResourceNotFoundException(
                                    "Pickup slot not found with id: "
                                            + request.getPickupSlotId()
                            )
                    );

            if (!pickupSlot.isActive()) {

                throw new IllegalArgumentException(
                        "Selected pickup slot is inactive"
                );
            }

            if (pickupSlot.getBookedCount()
                    >= pickupSlot.getCapacity()) {

                throw new IllegalArgumentException(
                        "Selected pickup slot is full"
                );
            }
        }

        // -----------------------------------------------------
        // Create Order
        // -----------------------------------------------------

        Order order = new Order();

        order.setOrderNumber(
                generateOrderNumber()
        );

        order.setUser(user);

        order.setFulfillmentType(
                request.getFulfillmentType()
        );

        order.setDeliveryAddress(
                request.getDeliveryAddress()
        );

        order.setPickupSlot(pickupSlot);

        order.setStatus(
                OrderStatus.PENDING
        );

        BigDecimal subtotal =
                BigDecimal.ZERO;

        // -----------------------------------------------------
        // Convert CartItems -> OrderItems
        // -----------------------------------------------------

        for (CartItem cartItem : cart.getItems()) {

            Product product =
                    cartItem.getProduct();

            // Re-check product status at checkout

            Product currentProduct =
                    productRepository
                            .findByIdAndActiveTrue(
                                    product.getId()
                            )
                            .orElseThrow(() ->
                                    new ResourceNotFoundException(
                                            "Product is no longer available: "
                                                    + product.getName()
                                    )
                            );

            int requestedQuantity =
                    cartItem.getQuantity();

            // Re-check stock at checkout

            if (currentProduct.getStockQuantity()
                    < requestedQuantity) {

                throw new IllegalArgumentException(
                        "Insufficient stock for product: "
                                + currentProduct.getName()
                                + ". Available stock: "
                                + currentProduct.getStockQuantity()
                );
            }

            BigDecimal unitPrice =
                    currentProduct.getPrice();

            BigDecimal itemSubtotal =
                    unitPrice.multiply(
                            BigDecimal.valueOf(
                                    requestedQuantity
                            )
                    );

            OrderItem orderItem =
                    new OrderItem();

            orderItem.setOrder(order);

            orderItem.setProduct(
                    currentProduct
            );

            orderItem.setQuantity(
                    requestedQuantity
            );

            // Store price snapshot

            orderItem.setUnitPrice(
                    unitPrice
            );

            orderItem.setSubtotal(
                    itemSubtotal
            );

            order.getItems().add(
                    orderItem
            );

            subtotal =
                    subtotal.add(
                            itemSubtotal
                    );

            // Deduct stock

            currentProduct.setStockQuantity(
                    currentProduct.getStockQuantity()
                            - requestedQuantity
            );

            productRepository.save(
                    currentProduct
            );
        }

        // -----------------------------------------------------
        // Delivery Charge
        // -----------------------------------------------------

        BigDecimal deliveryCharge;

        if (request.getFulfillmentType()
                == FulfillmentType.STORE_PICKUP) {

            deliveryCharge =
                    BigDecimal.ZERO;

        } else {

            deliveryCharge =
                    new BigDecimal("50.00");
        }

        BigDecimal totalAmount =
                subtotal.add(
                        deliveryCharge
                );

        order.setSubtotal(
                subtotal
        );

        order.setDeliveryCharge(
                deliveryCharge
        );

        order.setTotalAmount(
                totalAmount
        );

        // -----------------------------------------------------
        // Reserve Pickup Slot
        // -----------------------------------------------------

        if (pickupSlot != null) {

            pickupSlot.setBookedCount(
                    pickupSlot.getBookedCount() + 1
            );

            pickupSlotRepository.save(
                    pickupSlot
            );
        }

        // -----------------------------------------------------
        // Save Order
        // -----------------------------------------------------

        Order savedOrder =
                orderRepository.save(
                        order
                );

        // -----------------------------------------------------
        // AUDIT LOG - CREATE ORDER
        // -----------------------------------------------------

        auditLogService.createAuditLog(
                "CREATE_ORDER",
                "ORDER",
                savedOrder.getId(),
                "Order created successfully: "
                        + savedOrder.getOrderNumber()
        );

        // -----------------------------------------------------
        // Clear Cart
        // -----------------------------------------------------

        cartItemRepository.deleteByCartId(
                cart.getId()
        );

        cart.getItems().clear();

        return mapToResponse(
                savedOrder
        );
    }

    // =========================================================
    // GET ORDER BY ID - CUSTOMER
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public OrderResponse getOrderById(Long id) {

        User user =
                getAuthenticatedUser();

        Order order =
                orderRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Order not found with id: "
                                                + id
                                )
                        );

        // Customer can only view their own order

        if (!order.getUser().getId()
                .equals(user.getId())) {

            throw new ResourceNotFoundException(
                    "Order not found with id: "
                            + id
            );
        }

        return mapToResponse(
                order
        );
    }

    // =========================================================
    // GET MY ORDERS - CUSTOMER
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> getMyOrders() {

        User user =
                getAuthenticatedUser();

        return orderRepository
                .findByUserIdOrderByCreatedAtDesc(
                        user.getId()
                )
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // =========================================================
    // GET ALL ORDERS - ADMIN / STAFF / MANAGER
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> getAllOrders() {

        return orderRepository
                .findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // =========================================================
    // CANCEL ORDER - CUSTOMER
    // =========================================================

    @Override
    @Transactional
    public OrderResponse cancelOrder(Long id) {

        User user =
                getAuthenticatedUser();

        Order order =
                orderRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Order not found with id: "
                                                + id
                                )
                        );

        if (!order.getUser().getId()
                .equals(user.getId())) {

            throw new ResourceNotFoundException(
                    "Order not found with id: "
                            + id
            );
        }

        if (order.getStatus()
                != OrderStatus.PENDING
                && order.getStatus()
                != OrderStatus.CONFIRMED) {

            throw new IllegalArgumentException(
                    "Order cannot be cancelled at this stage"
            );
        }

        // -----------------------------------------------------
        // Restore Product Stock
        // -----------------------------------------------------

        for (OrderItem item :
                order.getItems()) {

            Product product =
                    item.getProduct();

            product.setStockQuantity(
                    product.getStockQuantity()
                            + item.getQuantity()
            );

            productRepository.save(
                    product
            );
        }

        // -----------------------------------------------------
        // Release Pickup Slot
        // -----------------------------------------------------

        if (order.getPickupSlot()
                != null) {

            PickupSlot pickupSlot =
                    order.getPickupSlot();

            if (pickupSlot.getBookedCount()
                    > 0) {

                pickupSlot.setBookedCount(
                        pickupSlot.getBookedCount()
                                - 1
                );

                pickupSlotRepository.save(
                        pickupSlot
                );
            }
        }

        // -----------------------------------------------------
        // Cancel Order
        // -----------------------------------------------------

        order.setStatus(
                OrderStatus.CANCELLED
        );

        Order cancelledOrder =
                orderRepository.save(
                        order
                );

        // -----------------------------------------------------
        // AUDIT LOG - CANCEL ORDER
        // -----------------------------------------------------

        auditLogService.createAuditLog(
                "CANCEL_ORDER",
                "ORDER",
                cancelledOrder.getId(),
                "Order cancelled: "
                        + cancelledOrder.getOrderNumber()
        );

        return mapToResponse(
                cancelledOrder
        );
    }

    // =========================================================
    // UPDATE ORDER STATUS - ADMIN / STAFF / MANAGER
    // =========================================================

    @Override
    @Transactional
    public OrderResponse updateOrderStatus(
            Long orderId,
            UpdateOrderStatusRequest request) {

        Order order =
                orderRepository.findById(
                        orderId
                )
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Order not found with id: "
                                        + orderId
                        )
                );

        OrderStatus currentStatus =
                order.getStatus();

        OrderStatus newStatus =
                request.getStatus();

        // -----------------------------------------------------
        // Validate Status Transition
        // -----------------------------------------------------

        if (!isValidStatusTransition(
                currentStatus,
                newStatus)) {

            throw new IllegalArgumentException(
                    "Invalid order status transition from "
                            + currentStatus
                            + " to "
                            + newStatus
            );
        }

        order.setStatus(
                newStatus
        );

        Order updatedOrder =
                orderRepository.save(
                        order
                );

        // -----------------------------------------------------
        // AUDIT LOG - UPDATE ORDER STATUS
        // -----------------------------------------------------

        auditLogService.createAuditLog(
                "UPDATE_ORDER_STATUS",
                "ORDER",
                updatedOrder.getId(),
                "Order status changed from "
                        + currentStatus
                        + " to "
                        + newStatus
        );

        return mapToResponse(
                updatedOrder
        );
    }

    // =========================================================
    // VALIDATE ORDER STATUS TRANSITION
    // =========================================================

    private boolean isValidStatusTransition(
            OrderStatus currentStatus,
            OrderStatus newStatus) {

        if (currentStatus == null
                || newStatus == null) {

            return false;
        }

        switch (currentStatus) {

            case PENDING:

                return newStatus
                        == OrderStatus.CONFIRMED

                        || newStatus
                        == OrderStatus.CANCELLED;

            case CONFIRMED:

                return newStatus
                        == OrderStatus.PREPARING

                        || newStatus
                        == OrderStatus.CANCELLED;

            case PREPARING:

                return newStatus
                        == OrderStatus.READY_FOR_PICKUP

                        || newStatus
                        == OrderStatus.OUT_FOR_DELIVERY;

            case READY_FOR_PICKUP:

                return newStatus
                        == OrderStatus.PICKED_UP;

            case OUT_FOR_DELIVERY:

                return newStatus
                        == OrderStatus.DELIVERED;

            case DELIVERED:
            case PICKED_UP:
            case CANCELLED:

                return false;

            default:

                return false;
        }
    }

    // =========================================================
    // GET AUTHENTICATED USER
    // =========================================================

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

        if (!(principal
                instanceof CustomUserDetails)) {

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

    // =========================================================
    // GENERATE ORDER NUMBER
    // =========================================================

    private String generateOrderNumber() {

        return "ORD-"
                + UUID.randomUUID()
                        .toString()
                        .substring(0, 8)
                        .toUpperCase();
    }

    // =========================================================
    // ENTITY -> RESPONSE DTO
    // =========================================================

    private OrderResponse mapToResponse(
            Order order) {

        OrderResponse response =
                new OrderResponse();

        response.setId(
                order.getId()
        );

        response.setOrderNumber(
                order.getOrderNumber()
        );

        response.setUserId(
                order.getUser().getId()
        );

        response.setStatus(
                order.getStatus()
        );

        response.setFulfillmentType(
                order.getFulfillmentType()
        );

        response.setDeliveryAddress(
                order.getDeliveryAddress()
        );

        response.setSubtotal(
                order.getSubtotal()
        );

        response.setDeliveryCharge(
                order.getDeliveryCharge()
        );

        response.setTotalAmount(
                order.getTotalAmount()
        );

        response.setCreatedAt(
                order.getCreatedAt()
        );

        response.setUpdatedAt(
                order.getUpdatedAt()
        );

        // -----------------------------------------------------
        // Pickup Slot Information
        // -----------------------------------------------------

        if (order.getPickupSlot()
                != null) {

            PickupSlot slot =
                    order.getPickupSlot();

            response.setPickupSlotId(
                    slot.getId()
            );

            response.setPickupDate(
                    slot.getSlotDate()
            );

            response.setPickupStartTime(
                    slot.getStartTime()
            );

            response.setPickupEndTime(
                    slot.getEndTime()
            );
        }

        // -----------------------------------------------------
        // Order Items
        // -----------------------------------------------------

        for (OrderItem item :
                order.getItems()) {

            OrderItemResponse itemResponse =
                    new OrderItemResponse();

            itemResponse.setId(
                    item.getId()
            );

            itemResponse.setProductId(
                    item.getProduct().getId()
            );

            itemResponse.setProductName(
                    item.getProduct().getName()
            );

            itemResponse.setQuantity(
                    item.getQuantity()
            );

            itemResponse.setUnitPrice(
                    item.getUnitPrice()
            );

            itemResponse.setSubtotal(
                    item.getSubtotal()
            );

            response.getItems().add(
                    itemResponse
            );
        }

        return response;
    }
}