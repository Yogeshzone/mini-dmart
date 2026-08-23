package com.dmart.mini_dmart.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final CustomUserDetailsService userDetailsService;

    public JwtAuthenticationFilter(
            JwtService jwtService,
            CustomUserDetailsService userDetailsService) {

        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        // ---------------------------------------------------------
        // Allow CORS preflight requests to pass through
        // ---------------------------------------------------------

        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            filterChain.doFilter(request, response);
            return;
        }

        // ---------------------------------------------------------
        // Get Authorization header
        // ---------------------------------------------------------

        final String authHeader =
                request.getHeader("Authorization");

        // ---------------------------------------------------------
        // No JWT -> continue normally
        // ---------------------------------------------------------

        if (authHeader == null ||
                !authHeader.startsWith("Bearer ")) {

            filterChain.doFilter(request, response);
            return;
        }

        // ---------------------------------------------------------
        // Extract JWT
        // ---------------------------------------------------------

        final String jwt =
                authHeader.substring(7);

        try {

            // -----------------------------------------------------
            // Extract username/email from JWT
            // -----------------------------------------------------

            final String userEmail =
                    jwtService.extractUsername(jwt);

            // -----------------------------------------------------
            // Authenticate user if not already authenticated
            // -----------------------------------------------------

            if (userEmail != null &&
                    SecurityContextHolder
                            .getContext()
                            .getAuthentication() == null) {

                UserDetails userDetails =
                        userDetailsService
                                .loadUserByUsername(userEmail);

                // -------------------------------------------------
                // Validate JWT
                // -------------------------------------------------

                if (jwtService.isTokenValid(jwt, userDetails)) {

                    UsernamePasswordAuthenticationToken authToken =
                            new UsernamePasswordAuthenticationToken(
                                    userDetails,
                                    null,
                                    userDetails.getAuthorities()
                            );

                    authToken.setDetails(
                            new WebAuthenticationDetailsSource()
                                    .buildDetails(request)
                    );

                    SecurityContextHolder
                            .getContext()
                            .setAuthentication(authToken);
                }
            }

        } catch (Exception exception) {

            // Invalid/expired JWT.
            // Continue without authentication.
        }

        // ---------------------------------------------------------
        // Continue request
        // ---------------------------------------------------------

        filterChain.doFilter(request, response);
    }
}