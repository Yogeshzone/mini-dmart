package com.dmart.mini_dmart.service;

import com.dmart.mini_dmart.entity.AuditLog;
import com.dmart.mini_dmart.entity.User;
import com.dmart.mini_dmart.exception.ResourceNotFoundException;
import com.dmart.mini_dmart.repository.AuditLogRepository;
import com.dmart.mini_dmart.repository.UserRepository;
import com.dmart.mini_dmart.security.CustomUserDetails;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuditLogServiceImpl implements AuditLogService {

    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;

    public AuditLogServiceImpl(
            AuditLogRepository auditLogRepository,
            UserRepository userRepository) {

        this.auditLogRepository = auditLogRepository;
        this.userRepository = userRepository;
    }

    // =========================================================
    // CREATE AUDIT LOG
    // =========================================================

    @Override
    @Transactional
    public AuditLog createAuditLog(
            String action,
            String entityType,
            Long entityId,
            String details) {

        AuditLog auditLog = new AuditLog();

        auditLog.setAction(action);
        auditLog.setEntityType(entityType);
        auditLog.setEntityId(entityId);
        auditLog.setDetails(details);

        /*
         * Get currently authenticated user.
         *
         * Some system operations may not have an authenticated
         * user, so performedBy is allowed to remain null.
         */

        User authenticatedUser = getAuthenticatedUser();

        if (authenticatedUser != null) {
            auditLog.setPerformedBy(authenticatedUser);
        }

        return auditLogRepository.save(auditLog);
    }

    // =========================================================
    // GET ALL AUDIT LOGS
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public Page<AuditLog> getAllAuditLogs(
            Pageable pageable) {

        return auditLogRepository
                .findAllByOrderByCreatedAtDesc(pageable);
    }

    // =========================================================
    // GET AUDIT LOGS BY USER
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public Page<AuditLog> getAuditLogsByUser(
            Long userId,
            Pageable pageable) {

        if (!userRepository.existsById(userId)) {

            throw new ResourceNotFoundException(
                    "User not found with id: " + userId
            );
        }

        return auditLogRepository
                .findByPerformedByIdOrderByCreatedAtDesc(
                        userId,
                        pageable
                );
    }

    // =========================================================
    // GET AUDIT LOGS BY ENTITY
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public Page<AuditLog> getAuditLogsByEntity(
            String entityType,
            Long entityId,
            Pageable pageable) {

        return auditLogRepository
                .findByEntityTypeAndEntityIdOrderByCreatedAtDesc(
                        entityType,
                        entityId,
                        pageable
                );
    }

    // =========================================================
    // GET AUTHENTICATED USER
    // =========================================================

    private User getAuthenticatedUser() {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        if (authentication == null
                || !authentication.isAuthenticated()) {

            return null;
        }

        Object principal =
                authentication.getPrincipal();

        /*
         * Anonymous authentication does not represent
         * an actual application user.
         */

        if (!(principal instanceof CustomUserDetails)) {

            return null;
        }

        CustomUserDetails userDetails =
                (CustomUserDetails) principal;

        return userRepository
                .findById(
                        userDetails.getUserId()
                )
                .orElse(null);
    }
}