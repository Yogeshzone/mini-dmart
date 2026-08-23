package com.dmart.mini_dmart.dto;

import com.dmart.mini_dmart.entity.ReturnStatus;
import jakarta.validation.constraints.NotNull;

public class UpdateReturnStatusRequest {

    @NotNull(message = "Return status is required")
    private ReturnStatus status;

    private String staffRemarks;

    public UpdateReturnStatusRequest() {
    }

    public ReturnStatus getStatus() {
        return status;
    }

    public void setStatus(ReturnStatus status) {
        this.status = status;
    }

    public String getStaffRemarks() {
        return staffRemarks;
    }

    public void setStaffRemarks(String staffRemarks) {
        this.staffRemarks = staffRemarks;
    }
}