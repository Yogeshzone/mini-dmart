package com.dmart.mini_dmart.controller;

import com.dmart.mini_dmart.repository.AuditLogRepository;
import com.dmart.mini_dmart.repository.ExchangeRequestRepository;
import com.dmart.mini_dmart.repository.OrderRepository;
import com.dmart.mini_dmart.repository.ProductRepository;
import com.dmart.mini_dmart.repository.UserRepository;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final ExchangeRequestRepository exchangeRequestRepository;
    private final UserRepository userRepository;
    private final AuditLogRepository auditLogRepository;

    public AdminController(
            ProductRepository productRepository,
            OrderRepository orderRepository,
            ExchangeRequestRepository exchangeRequestRepository,
            UserRepository userRepository,
            AuditLogRepository auditLogRepository) {

        this.productRepository = productRepository;
        this.orderRepository = orderRepository;
        this.exchangeRequestRepository = exchangeRequestRepository;
        this.userRepository = userRepository;
        this.auditLogRepository = auditLogRepository;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboard() {

        Map<String, Object> dashboard = new LinkedHashMap<>();

        dashboard.put(
                "totalProducts",
                productRepository.count()
        );

        dashboard.put(
                "totalOrders",
                orderRepository.count()
        );

        dashboard.put(
                "totalExchanges",
                exchangeRequestRepository.count()
        );

        dashboard.put(
                "totalUsers",
                userRepository.count()
        );

        dashboard.put(
                "totalAuditLogs",
                auditLogRepository.count()
        );

        return ResponseEntity.ok(dashboard);
    }
}