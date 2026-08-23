package com.dmart.mini_dmart.dto;

import com.dmart.mini_dmart.entity.FulfillmentType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class CreateOrderRequest {

    @NotNull(message = "Fulfillment type is required")
    private FulfillmentType fulfillmentType;

    @Size(max = 1000, message = "Delivery address cannot exceed 1000 characters")
    private String deliveryAddress;

    private Long pickupSlotId;

    public CreateOrderRequest() {
    }

    public FulfillmentType getFulfillmentType() {
        return fulfillmentType;
    }

    public void setFulfillmentType(FulfillmentType fulfillmentType) {
        this.fulfillmentType = fulfillmentType;
    }

    public String getDeliveryAddress() {
        return deliveryAddress;
    }

    public void setDeliveryAddress(String deliveryAddress) {
        this.deliveryAddress = deliveryAddress;
    }

    public Long getPickupSlotId() {
        return pickupSlotId;
    }

    public void setPickupSlotId(Long pickupSlotId) {
        this.pickupSlotId = pickupSlotId;
    }
}