package com.dmart.mini_dmart.service;

import com.dmart.mini_dmart.dto.ReturnRequestDto;
import com.dmart.mini_dmart.dto.UpdateReturnStatusRequest;

import java.util.List;

public interface ReturnService {

    ReturnRequestDto createReturnRequest(
            ReturnRequestDto request
    );

    List<ReturnRequestDto> getMyReturnRequests();

    ReturnRequestDto getReturnRequestById(
            Long id
    );

    List<ReturnRequestDto> getAllReturnRequests();

    ReturnRequestDto updateReturnStatus(
            Long id,
            UpdateReturnStatusRequest request
    );
}