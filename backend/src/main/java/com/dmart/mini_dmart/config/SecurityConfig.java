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

            .cors(cors -> cors.configurationSource(
                    corsConfigurationSource()
            ))

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

                // CORS preflight requests
                .requestMatchers(HttpMethod.OPTIONS, "/**")
                .permitAll()

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

                // 401 - UNAUTHORIZED
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

                // 403 - FORBIDDEN
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

    // =========================================================
    // CORS CONFIGURATION
    // =========================================================

    @Bean
    public org.springframework.web.cors.CorsConfigurationSource
    corsConfigurationSource() {

        org.springframework.web.cors.CorsConfiguration configuration =
                new org.springframework.web.cors.CorsConfiguration();

        java.util.List<String> allowedOriginPatterns = new java.util.ArrayList<>(
                java.util.List.of(
                        "http://localhost:*",
                        "http://127.0.0.1:*",
                        "https://*.onrender.com",
                        "https://*.vercel.app",
                        "https://*.netlify.app"
                )
        );

        String customOrigins = System.getenv("CORS_ALLOWED_ORIGINS");
        if (customOrigins != null && !customOrigins.isBlank()) {
            for (String origin : customOrigins.split(",")) {
                String trimmed = origin.trim();
                if (!trimmed.isEmpty() && !allowedOriginPatterns.contains(trimmed)) {
                    allowedOriginPatterns.add(trimmed);
                }
            }
        }

        String frontendUrl = System.getenv("FRONTEND_URL");
        if (frontendUrl != null && !frontendUrl.isBlank()) {
            String trimmed = frontendUrl.trim();
            if (!allowedOriginPatterns.contains(trimmed)) {
                allowedOriginPatterns.add(trimmed);
            }
        }

        configuration.setAllowedOriginPatterns(allowedOriginPatterns);

        configuration.setAllowedMethods(
                java.util.List.of(
                        "GET",
                        "POST",
                        "PUT",
                        "PATCH",
                        "DELETE",
                        "OPTIONS"
                )
        );

        configuration.setAllowedHeaders(
                java.util.List.of("*")
        );

        configuration.setExposedHeaders(
                java.util.List.of("Authorization", "Content-Type")
        );

        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        org.springframework.web.cors.UrlBasedCorsConfigurationSource source =
                new org.springframework.web.cors.UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration(
                "/**",
                configuration
        );

        return source;
    }
}