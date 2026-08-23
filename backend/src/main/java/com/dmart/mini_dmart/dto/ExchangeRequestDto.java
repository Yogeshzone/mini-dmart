package com.dmart.mini_dmart.dto;

import com.dmart.mini_dmart.entity.ExchangeStatus;

import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public class ExchangeRequestDto {

    private Long id;

    private Long orderItemId;

    private Long replacementProductId;

    private Integer quantity;

    @Size(
            max = 1000,
            message = "Exchange reason cannot exceed 1000 characters"
    )
    private String reason;

    private ExchangeStatus status;

    private LocalDateTime requestedAt;

    private LocalDateTime processedAt;

    private String staffRemarks;


    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public ExchangeRequestDto() {
    }


    // =========================================================
    // GETTERS AND SETTERS
    // =========================================================

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }


    public Long getOrderItemId() {
        return orderItemId;
    }

    public void setOrderItemId(Long orderItemId) {
        this.orderItemId = orderItemId;
    }


    public Long getReplacementProductId() {
        return replacementProductId;
    }

    public void setReplacementProductId(
            Long replacementProductId) {

        this.replacementProductId =
                replacementProductId;
    }


    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }


    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }


    public ExchangeStatus getStatus() {
        return status;
    }

    public void setStatus(ExchangeStatus status) {
        this.status = status;
    }


    public LocalDateTime getRequestedAt() {
        return requestedAt;
    }

    public void setRequestedAt(
            LocalDateTime requestedAt) {

        this.requestedAt = requestedAt;
    }


    public LocalDateTime getProcessedAt() {
        return processedAt;
    }

    public void setProcessedAt(
            LocalDateTime processedAt) {

        this.processedAt = processedAt;
    }


    public String getStaffRemarks() {
        return staffRemarks;
    }

    public void setStaffRemarks(
            String staffRemarks) {

        this.staffRemarks = staffRemarks;
    }
}