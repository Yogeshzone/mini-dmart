package com.dmart.mini_dmart.service;

import com.dmart.mini_dmart.entity.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface AuditLogService {

    AuditLog createAuditLog(
            String action,
            String entityType,
            Long entityId,
            String details
    );

    Page<AuditLog> getAllAuditLogs(
            Pageable pageable
    );

    Page<AuditLog> getAuditLogsByUser(
            Long userId,
            Pageable pageable
    );

    Page<AuditLog> getAuditLogsByEntity(
            String entityType,
            Long entityId,
            Pageable pageable
    );
}