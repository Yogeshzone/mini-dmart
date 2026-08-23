package com.dmart.mini_dmart.service;

import com.dmart.mini_dmart.dto.ExchangeRequestDto;

import java.util.List;

public interface ExchangeService {

    ExchangeRequestDto createExchangeRequest(
            ExchangeRequestDto request
    );

    List<ExchangeRequestDto> getMyExchangeRequests();

    ExchangeRequestDto getExchangeRequestById(
            Long id
    );

    List<ExchangeRequestDto> getAllExchangeRequests();

    ExchangeRequestDto updateExchangeStatus(
            Long id,
            ExchangeRequestDto request
    );
}