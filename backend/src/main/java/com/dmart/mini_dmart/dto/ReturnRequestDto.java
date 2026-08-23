package com.dmart.mini_dmart.dto;

import com.dmart.mini_dmart.entity.ReturnStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public class ReturnRequestDto {

    private Long id;

    @NotNull(message = "Order item ID is required")
    private Long orderItemId;

    @NotBlank(message = "Return reason is required")
    @Size(max = 1000, message = "Reason cannot exceed 1000 characters")
    private String reason;

    private ReturnStatus status;

    private LocalDateTime requestedAt;

    private LocalDateTime processedAt;

    private String staffRemarks;

    public ReturnRequestDto() {
    }

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

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public ReturnStatus getStatus() {
        return status;
    }

    public void setStatus(ReturnStatus status) {
        this.status = status;
    }

    public LocalDateTime getRequestedAt() {
        return requestedAt;
    }

    public void setRequestedAt(LocalDateTime requestedAt) {
        this.requestedAt = requestedAt;
    }

    public LocalDateTime getProcessedAt() {
        return processedAt;
    }

    public void setProcessedAt(LocalDateTime processedAt) {
        this.processedAt = processedAt;
    }

    public String getStaffRemarks() {
        return staffRemarks;
    }

    public void setStaffRemarks(String staffRemarks) {
        this.staffRemarks = staffRemarks;
    }
}