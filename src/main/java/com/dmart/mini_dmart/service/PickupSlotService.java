package com.dmart.mini_dmart.service;

import com.dmart.mini_dmart.dto.CreatePickupSlotRequest;
import com.dmart.mini_dmart.dto.PickupSlotResponse;

import java.time.LocalDate;
import java.util.List;

public interface PickupSlotService {

    PickupSlotResponse createSlot(CreatePickupSlotRequest request);

    List<PickupSlotResponse> getAvailableSlots(LocalDate date);

    List<PickupSlotResponse> getAvailableSlots(
            LocalDate startDate,
            LocalDate endDate
    );
}