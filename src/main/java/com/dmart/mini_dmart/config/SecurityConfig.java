package com.dmart.mini_dmart.config;

import com.dmart.mini_dmart.security.CustomUserDetailsService;
import com.dmart.mini_dmart.security.JwtAuthenticationFilter;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.http.HttpStatus;
import org.springframework.http.HttpMethod;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;

import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final CustomUserDetailsService userDetailsService;

    public SecurityConfig(
            JwtAuthenticationFilter jwtAuthenticationFilter,
            CustomUserDetailsService userDetailsService) {

        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.userDetailsService = userDetailsService;
    }

    // =========================================================
    // PASSWORD ENCODER
    // =========================================================

    @Bean
    public PasswordEncoder passwordEncoder() {

        return new BCryptPasswordEncoder();
    }

    // =========================================================
    // AUTHENTICATION PROVIDER
    // =========================================================

    @Bean
    public AuthenticationProvider authenticationProvider() {

        DaoAuthenticationProvider provider =
                new DaoAuthenticationProvider(userDetailsService);

        provider.setPasswordEncoder(passwordEncoder());

        return provider;
    }

    // =========================================================
    // AUTHENTICATION MANAGER
    // =========================================================

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration configuration)
            throws Exception {

        return configuration.getAuthenticationManager();
    }

    // =========================================================
    // SECURITY FILTER CHAIN
    // =========================================================

    @Bean
    public SecurityFilterChain securityFilterChain(
            org.springframework.security.config.annotation.web.builders.HttpSecurity http)
            throws Exception {

        http

            // -------------------------------------------------
            // CSRF
            // -------------------------------------------------

            .csrf(csrf -> csrf.disable())

            // -------------------------------------------------
            // CORS
            // -------------------------------------------------

            .cors(cors -> {})

            // -------------------------------------------------
            // SESSION MANAGEMENT
            // -------------------------------------------------

            .sessionManagement(session ->
                session.sessionCreationPolicy(
                    SessionCreationPolicy.STATELESS
                )
            )

            // -------------------------------------------------
            // AUTHENTICATION PROVIDER
            // -------------------------------------------------

            .authenticationProvider(
                authenticationProvider()
            )

            // -------------------------------------------------
            // AUTHORIZATION RULES
            // -------------------------------------------------

            .authorizeHttpRequests(auth -> auth

                // Authentication APIs are public
                .requestMatchers("/api/auth/**")
                .permitAll()

                // Product browsing is public
                .requestMatchers(
                    HttpMethod.GET,
                    "/api/products/**"
                )
                .permitAll()

                // Category browsing is public
                .requestMatchers(
                    HttpMethod.GET,
                    "/api/categories/**"
                )
                .permitAll()

                // Every other endpoint requires authentication
                .anyRequest()
                .authenticated()
            )

            // -------------------------------------------------
            // EXCEPTION HANDLING
            // -------------------------------------------------

            .exceptionHandling(exception -> exception

                // -------------------------------------------------
                // 401 - UNAUTHORIZED
                // No JWT / invalid authentication
                // -------------------------------------------------

                .authenticationEntryPoint(
                    (request, response, authException) -> {

                        response.setStatus(
                            HttpStatus.UNAUTHORIZED.value()
                        );

                        response.setContentType(
                            "application/json"
                        );

                        response.getWriter().write("""
                            {
                                "error": "Unauthorized",
                                "message": "Authentication is required",
                                "status": 401
                            }
                            """);
                    }
                )

                // -------------------------------------------------
                // 403 - FORBIDDEN
                // Authenticated but insufficient role
                // -------------------------------------------------

                .accessDeniedHandler(
                    (request, response, accessDeniedException) -> {

                        response.setStatus(
                            HttpStatus.FORBIDDEN.value()
                        );

                        response.setContentType(
                            "application/json"
                        );

                        response.getWriter().write("""
                            {
                                "error": "Forbidden",
                                "message": "Access Denied",
                                "status": 403
                            }
                            """);
                    }
                )
            )

            // -------------------------------------------------
            // JWT FILTER
            // -------------------------------------------------

            .addFilterBefore(
                jwtAuthenticationFilter,
                UsernamePasswordAuthenticationFilter.class
            );

        return http.build();
    }
}