package com.dmart.mini_dmart.controller;

import com.dmart.mini_dmart.dto.ReturnRequestDto;
import com.dmart.mini_dmart.dto.UpdateReturnStatusRequest;
import com.dmart.mini_dmart.service.ReturnService;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/returns")
public class ReturnController {

    private final ReturnService returnService;

    public ReturnController(
            ReturnService returnService) {

        this.returnService = returnService;
    }

    // =========================================================
    // CUSTOMER - CREATE RETURN REQUEST
    // =========================================================

    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ReturnRequestDto> createReturnRequest(
            @Valid @RequestBody ReturnRequestDto request) {

        return ResponseEntity.ok(
                returnService.createReturnRequest(request)
        );
    }

    // =========================================================
    // CUSTOMER - VIEW MY RETURN REQUESTS
    // =========================================================

    @GetMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<List<ReturnRequestDto>>
    getMyReturnRequests() {

        return ResponseEntity.ok(
                returnService.getMyReturnRequests()
        );
    }

    // =========================================================
    // CUSTOMER - VIEW SINGLE RETURN REQUEST
    // =========================================================

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ReturnRequestDto>
    getReturnRequestById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                returnService.getReturnRequestById(id)
        );
    }

    // =========================================================
    // ADMIN / STAFF / MANAGER - VIEW ALL RETURNS
    // =========================================================

    @GetMapping("/admin")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF', 'MANAGER')")
    public ResponseEntity<List<ReturnRequestDto>>
    getAllReturnRequests() {

        return ResponseEntity.ok(
                returnService.getAllReturnRequests()
        );
    }

    // =========================================================
    // ADMIN / STAFF / MANAGER - UPDATE RETURN STATUS
    // =========================================================

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF', 'MANAGER')")
    public ResponseEntity<ReturnRequestDto>
    updateReturnStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateReturnStatusRequest request) {

        return ResponseEntity.ok(
                returnService.updateReturnStatus(
                        id,
                        request
                )
        );
    }
}