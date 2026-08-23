package com.dmart.mini_dmart.service;

import com.dmart.mini_dmart.dto.InventoryResponse;
import com.dmart.mini_dmart.dto.UpdateInventoryRequest;

import java.util.List;

public interface InventoryService {

    InventoryResponse getInventory(Long productId);

    List<InventoryResponse> getAllInventory();

    InventoryResponse updateInventory(
            Long productId,
            UpdateInventoryRequest request
    );
}