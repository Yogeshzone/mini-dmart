package com.dmart.mini_dmart.service;

import com.dmart.mini_dmart.dto.AuthResponse;
import com.dmart.mini_dmart.dto.LoginRequest;
import com.dmart.mini_dmart.dto.RegisterRequest;
import com.dmart.mini_dmart.dto.UserResponse;
import com.dmart.mini_dmart.entity.Cart;
import com.dmart.mini_dmart.entity.Role;
import com.dmart.mini_dmart.entity.User;
import com.dmart.mini_dmart.repository.CartRepository;
import com.dmart.mini_dmart.repository.RoleRepository;
import com.dmart.mini_dmart.repository.UserRepository;
import com.dmart.mini_dmart.security.CustomUserDetails;
import com.dmart.mini_dmart.security.JwtService;

import jakarta.transaction.Transactional;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final CartRepository cartRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthServiceImpl(
            UserRepository userRepository,
            RoleRepository roleRepository,
            CartRepository cartRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            JwtService jwtService) {

        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.cartRepository = cartRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    @Override
    @Transactional
    public UserResponse register(RegisterRequest request) {

        // Check duplicate email
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException(
                    "Email is already registered"
            );
        }

        // Check duplicate phone
        if (userRepository.existsByPhone(request.getPhone())) {
            throw new IllegalArgumentException(
                    "Phone number is already registered"
            );
        }

        // Find CUSTOMER role
        Role customerRole = roleRepository.findByName("CUSTOMER")
                .orElseThrow(() ->
                        new IllegalStateException(
                                "CUSTOMER role is not configured"
                        )
                );

        // Create user
        User user = new User();

        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPassword(
                passwordEncoder.encode(request.getPassword())
        );
        user.setPhone(request.getPhone());
        user.setAddress(request.getAddress());
        user.setEnabled(true);

        Set<Role> roles = new HashSet<>();
        roles.add(customerRole);

        user.setRoles(roles);

        // Save user
        User savedUser = userRepository.save(user);

        // Create empty cart for new customer
        Cart cart = new Cart();
        cart.setUser(savedUser);

        cartRepository.save(cart);

        return mapToUserResponse(savedUser);
    }

    @Override
    public AuthResponse login(LoginRequest request) {

        Authentication authentication =
                authenticationManager.authenticate(
                        new UsernamePasswordAuthenticationToken(
                                request.getEmail(),
                                request.getPassword()
                        )
                );

        CustomUserDetails userDetails =
                (CustomUserDetails) authentication.getPrincipal();

        String token =
                jwtService.generateToken(userDetails);

        User user = userDetails.getUser();

        UserResponse userResponse =
                mapToUserResponse(user);

        return new AuthResponse(
                token,
                "Bearer",
                userResponse
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
}