package com.dmart.mini_dmart.service;

import com.dmart.mini_dmart.dto.UpdateProfileRequest;
import com.dmart.mini_dmart.dto.UserResponse;
import com.dmart.mini_dmart.entity.Role;
import com.dmart.mini_dmart.entity.User;
import com.dmart.mini_dmart.exception.ResourceNotFoundException;
import com.dmart.mini_dmart.repository.UserRepository;
import com.dmart.mini_dmart.security.CustomUserDetails;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    public UserServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getMyProfile() {

        User user = getAuthenticatedUser();

        return mapToUserResponse(user);
    }

    @Override
    @Transactional
    public UserResponse updateMyProfile(UpdateProfileRequest request) {

        User user = getAuthenticatedUser();

        if (request.getFullName() != null &&
                !request.getFullName().isBlank()) {

            user.setFullName(request.getFullName());
        }

        if (request.getPhone() != null &&
                !request.getPhone().isBlank() &&
                !request.getPhone().equals(user.getPhone())) {

            if (userRepository.existsByPhone(request.getPhone())) {

                throw new IllegalArgumentException(
                        "Phone number is already registered"
                );
            }

            user.setPhone(request.getPhone());
        }

        if (request.getAddress() != null) {
            user.setAddress(request.getAddress());
        }

        User updatedUser = userRepository.save(user);

        return mapToUserResponse(updatedUser);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers() {

        return userRepository.findAll()
                .stream()
                .map(this::mapToUserResponse)
                .collect(Collectors.toList());
    }

    private User getAuthenticatedUser() {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        if (authentication == null ||
                !authentication.isAuthenticated()) {

            throw new IllegalStateException(
                    "User is not authenticated"
            );
        }

        Object principal = authentication.getPrincipal();

        if (!(principal instanceof CustomUserDetails)) {

            throw new IllegalStateException(
                    "Invalid authenticated user"
            );
        }

        CustomUserDetails userDetails =
                (CustomUserDetails) principal;

        return userRepository.findById(userDetails.getUserId())
                .orElseThrow(() ->
                        new IllegalStateException(
                                "Authenticated user no longer exists"
                        )
                );
    }

    private UserResponse mapToUserResponse(User user) {

        UserResponse response = new UserResponse();

        response.setId(user.getId());
        response.setFullName(user.getFullName());
        response.setEmail(user.getEmail());
        response.setPhone(user.getPhone());
        response.setAddress(user.getAddress());
        response.setEnabled(user.isEnabled());
        response.setCreatedAt(user.getCreatedAt());

        response.setRoles(
                user.getRoles()
                        .stream()
                        .map(Role::getName)
                        .collect(Collectors.toSet())
        );

        return response;
    }
    
    @Override
    @Transactional
    public UserResponse updateUserStatus(
            Long id,
            boolean enabled) {

        User user =
                userRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "User not found with id: " + id
                                )
                        );

        user.setEnabled(enabled);

        User updatedUser =
                userRepository.save(user);

        return mapToUserResponse(updatedUser);
    }
    
}