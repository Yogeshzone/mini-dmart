package com.dmart.mini_dmart.repository;

import com.dmart.mini_dmart.entity.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AuditLogRepository
        extends JpaRepository<AuditLog, Long> {

    Page<AuditLog> findAllByOrderByCreatedAtDesc(
            Pageable pageable
    );

    Page<AuditLog> findByPerformedByIdOrderByCreatedAtDesc(
            Long userId,
            Pageable pageable
    );

    Page<AuditLog> findByEntityTypeAndEntityIdOrderByCreatedAtDesc(
            String entityType,
            Long entityId,
            Pageable pageable
    );
}