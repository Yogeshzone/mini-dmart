package com.dmart.mini_dmart.repository;

import com.dmart.mini_dmart.entity.PickupSlot;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

public interface PickupSlotRepository extends JpaRepository<PickupSlot, Long> {

    List<PickupSlot> findBySlotDateAndActiveTrueOrderByStartTimeAsc(
            LocalDate slotDate
    );

    Optional<PickupSlot> findBySlotDateAndStartTimeAndEndTime(
            LocalDate slotDate,
            LocalTime startTime,
            LocalTime endTime
    );

    List<PickupSlot> findBySlotDateBetweenAndActiveTrueOrderBySlotDateAscStartTimeAsc(
            LocalDate startDate,
            LocalDate endDate
    );
}