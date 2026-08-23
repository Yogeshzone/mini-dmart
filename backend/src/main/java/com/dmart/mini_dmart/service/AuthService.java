package com.dmart.mini_dmart.service;

import com.dmart.mini_dmart.dto.AuthResponse;
import com.dmart.mini_dmart.dto.LoginRequest;
import com.dmart.mini_dmart.dto.RegisterRequest;
import com.dmart.mini_dmart.dto.UserResponse;

public interface AuthService {

    UserResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);
}