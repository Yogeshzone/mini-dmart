package com.dmart.mini_dmart.service;

import com.dmart.mini_dmart.dto.CreatePickupSlotRequest;
import com.dmart.mini_dmart.dto.PickupSlotResponse;
import com.dmart.mini_dmart.entity.PickupSlot;
import com.dmart.mini_dmart.repository.PickupSlotRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PickupSlotServiceImpl implements PickupSlotService {

    private final PickupSlotRepository pickupSlotRepository;

    public PickupSlotServiceImpl(
            PickupSlotRepository pickupSlotRepository) {

        this.pickupSlotRepository = pickupSlotRepository;
    }

    @Override
    @Transactional
    public PickupSlotResponse createSlot(
            CreatePickupSlotRequest request) {

        if (!request.getEndTime()
                .isAfter(request.getStartTime())) {

            throw new IllegalArgumentException(
                    "End time must be after start time"
            );
        }

        if (request.getSlotDate()
                .isBefore(LocalDate.now())) {

            throw new IllegalArgumentException(
                    "Slot date cannot be in the past"
            );
        }

        boolean exists =
                pickupSlotRepository
                        .findBySlotDateAndStartTimeAndEndTime(
                                request.getSlotDate(),
                                request.getStartTime(),
                                request.getEndTime()
                        )
                        .isPresent();

        if (exists) {

            throw new IllegalArgumentException(
                    "Pickup slot already exists"
            );
        }

        PickupSlot slot =
                new PickupSlot();

        slot.setSlotDate(
                request.getSlotDate()
        );

        slot.setStartTime(
                request.getStartTime()
        );

        slot.setEndTime(
                request.getEndTime()
        );

        slot.setCapacity(
                request.getCapacity()
        );

        slot.setBookedCount(0);

        slot.setActive(true);

        PickupSlot savedSlot =
                pickupSlotRepository.save(slot);

        return mapToResponse(savedSlot);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PickupSlotResponse> getAvailableSlots(
            LocalDate date) {

        return pickupSlotRepository
                .findBySlotDateAndActiveTrueOrderByStartTimeAsc(date)
                .stream()
                .filter(this::hasAvailableCapacity)
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<PickupSlotResponse> getAvailableSlots(
            LocalDate startDate,
            LocalDate endDate) {

        return pickupSlotRepository
                .findBySlotDateBetweenAndActiveTrueOrderBySlotDateAscStartTimeAsc(
                        startDate,
                        endDate
                )
                .stream()
                .filter(this::hasAvailableCapacity)
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private boolean hasAvailableCapacity(
            PickupSlot slot) {

        return slot.getBookedCount()
                < slot.getCapacity();
    }

    private PickupSlotResponse mapToResponse(
            PickupSlot slot) {

        PickupSlotResponse response =
                new PickupSlotResponse();

        response.setId(
                slot.getId()
        );

        response.setSlotDate(
                slot.getSlotDate()
        );

        response.setStartTime(
                slot.getStartTime()
        );

        response.setEndTime(
                slot.getEndTime()
        );

        response.setCapacity(
                slot.getCapacity()
        );

        response.setBookedCount(
                slot.getBookedCount()
        );

        response.setAvailableCapacity(
                slot.getCapacity()
                        - slot.getBookedCount()
        );

        response.setActive(
                slot.isActive()
        );

        return response;
    }
}