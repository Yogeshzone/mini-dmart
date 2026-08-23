package com.dmart.mini_dmart.controller;

import com.dmart.mini_dmart.dto.ExchangeRequestDto;
import com.dmart.mini_dmart.service.ExchangeService;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/exchanges")
public class ExchangeController {

    private final ExchangeService exchangeService;

    public ExchangeController(
            ExchangeService exchangeService) {

        this.exchangeService = exchangeService;
    }

    // =========================================================
    // CUSTOMER - CREATE EXCHANGE REQUEST
    // =========================================================

    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ExchangeRequestDto> createExchangeRequest(
            @Valid @RequestBody ExchangeRequestDto request) {

        return ResponseEntity.ok(
                exchangeService.createExchangeRequest(request)
        );
    }

    // =========================================================
    // CUSTOMER - VIEW MY EXCHANGE REQUESTS
    // =========================================================

    @GetMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<List<ExchangeRequestDto>>
    getMyExchangeRequests() {

        return ResponseEntity.ok(
                exchangeService.getMyExchangeRequests()
        );
    }

    // =========================================================
    // CUSTOMER - VIEW SINGLE EXCHANGE REQUEST
    // =========================================================

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ExchangeRequestDto>
    getExchangeRequestById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                exchangeService.getExchangeRequestById(id)
        );
    }

    // =========================================================
    // ADMIN / STAFF / MANAGER - VIEW ALL EXCHANGE REQUESTS
    // =========================================================

    @GetMapping("/admin")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF', 'MANAGER')")
    public ResponseEntity<List<ExchangeRequestDto>>
    getAllExchangeRequests() {

        return ResponseEntity.ok(
                exchangeService.getAllExchangeRequests()
        );
    }

    // =========================================================
    // ADMIN / STAFF / MANAGER - UPDATE EXCHANGE STATUS
    // =========================================================

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF', 'MANAGER')")
    public ResponseEntity<ExchangeRequestDto>
    updateExchangeStatus(
            @PathVariable Long id,
            @Valid @RequestBody ExchangeRequestDto request) {

        return ResponseEntity.ok(
                exchangeService.updateExchangeStatus(
                        id,
                        request
                )
        );
    }
}