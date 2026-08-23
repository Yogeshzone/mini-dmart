package com.dmart.mini_dmart.service;

import com.dmart.mini_dmart.dto.UpdateProfileRequest;
import com.dmart.mini_dmart.dto.UserResponse;

import java.util.List;

public interface UserService {

    // Customer profile
    UserResponse getMyProfile();

    UserResponse updateMyProfile(
            UpdateProfileRequest request
    );

    // Admin user management
    List<UserResponse> getAllUsers();
    
    UserResponse updateUserStatus(Long id, boolean enabled);
}