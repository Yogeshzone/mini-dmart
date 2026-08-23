package com.dmart.mini_dmart.controller;

import com.dmart.mini_dmart.dto.CreatePickupSlotRequest;
import com.dmart.mini_dmart.dto.PickupSlotResponse;
import com.dmart.mini_dmart.service.PickupSlotService;

import jakarta.validation.Valid;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/pickup-slots")
public class PickupSlotController {

    private final PickupSlotService pickupSlotService;

    public PickupSlotController(
            PickupSlotService pickupSlotService) {

        this.pickupSlotService = pickupSlotService;
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PickupSlotResponse> createSlot(
            @Valid @RequestBody CreatePickupSlotRequest request) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        pickupSlotService.createSlot(request)
                );
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    public ResponseEntity<List<PickupSlotResponse>> getAvailableSlots(
            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate date) {

        return ResponseEntity.ok(
                pickupSlotService.getAvailableSlots(date)
        );
    }

    @GetMapping("/range")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    public ResponseEntity<List<PickupSlotResponse>> getAvailableSlots(
            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate startDate,

            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate endDate) {

        return ResponseEntity.ok(
                pickupSlotService.getAvailableSlots(
                        startDate,
                        endDate
                )
        );
    }
}