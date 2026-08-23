package com.dmart.mini_dmart.controller;

import com.dmart.mini_dmart.entity.AuditLog;
import com.dmart.mini_dmart.service.AuditLogService;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import org.springframework.http.ResponseEntity;

import org.springframework.security.access.prepost.PreAuthorize;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/audit-logs")
@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
public class AuditLogController {

    private final AuditLogService auditLogService;

    public AuditLogController(
            AuditLogService auditLogService) {

        this.auditLogService = auditLogService;
    }

    // =========================================================
    // GET ALL AUDIT LOGS
    // =========================================================

    @GetMapping
    public ResponseEntity<Page<AuditLog>> getAllAuditLogs(

            @RequestParam(defaultValue = "0")
            int page,

            @RequestParam(defaultValue = "20")
            int size) {

        Pageable pageable =
                PageRequest.of(
                        page,
                        size,
                        Sort.by(
                                Sort.Direction.DESC,
                                "createdAt"
                        )
                );

        return ResponseEntity.ok(
                auditLogService.getAllAuditLogs(
                        pageable
                )
        );
    }

    // =========================================================
    // GET AUDIT LOGS BY USER
    // =========================================================

    @GetMapping("/user/{userId}")
    public ResponseEntity<Page<AuditLog>>
    getAuditLogsByUser(

            @PathVariable Long userId,

            @RequestParam(defaultValue = "0")
            int page,

            @RequestParam(defaultValue = "20")
            int size) {

        Pageable pageable =
                PageRequest.of(
                        page,
                        size,
                        Sort.by(
                                Sort.Direction.DESC,
                                "createdAt"
                        )
                );

        return ResponseEntity.ok(
                auditLogService.getAuditLogsByUser(
                        userId,
                        pageable
                )
        );
    }

    // =========================================================
    // GET AUDIT LOGS BY ENTITY
    // =========================================================

    @GetMapping("/entity/{entityType}/{entityId}")
    public ResponseEntity<Page<AuditLog>>
    getAuditLogsByEntity(

            @PathVariable String entityType,

            @PathVariable Long entityId,

            @RequestParam(defaultValue = "0")
            int page,

            @RequestParam(defaultValue = "20")
            int size) {

        Pageable pageable =
                PageRequest.of(
                        page,
                        size,
                        Sort.by(
                                Sort.Direction.DESC,
                                "createdAt"
                        )
                );

        return ResponseEntity.ok(
                auditLogService.getAuditLogsByEntity(
                        entityType,
                        entityId,
                        pageable
                )
        );
    }
}