package com.legalcms.controller;

import com.legalcms.dto.ApiResponse;
import com.legalcms.dto.AuditEventDto;
import com.legalcms.entity.AuditEvent;
import com.legalcms.service.AuditService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/audit-events")
@RequiredArgsConstructor
public class AuditEventController {

    private final AuditService auditService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'AUDITOR', 'DEPARTMENT_HEAD', 'FINANCE_OFFICER')")
    public ResponseEntity<ApiResponse<List<AuditEventDto>>> getAuditEvents(
            @RequestParam(required = false) String entityType,
            @RequestParam(required = false) Long entityId
    ) {
        List<AuditEvent> events;
        if (entityType != null && entityId != null) {
            events = auditService.getEventsForEntity(entityType, entityId);
        } else {
            events = auditService.getAllEvents();
        }

        List<AuditEventDto> dtos = events.stream().map(e -> AuditEventDto.builder()
                .id(e.getId())
                .actorId(e.getActor() != null ? e.getActor().getId() : null)
                .actorName(e.getActor() != null ? e.getActor().getName() : "SYSTEM")
                .roleCode(e.getRoleCode())
                .action(e.getAction())
                .entityType(e.getEntityType())
                .entityId(e.getEntityId())
                .beforeAfterSummary(e.getBeforeAfterSummary())
                .reason(e.getReason())
                .createdAt(e.getCreatedAt())
                .requestId(e.getRequestId())
                .build()
        ).collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.ok(dtos));
    }

    @GetMapping("/verify")
    @PreAuthorize("hasAnyRole('ADMIN', 'AUDITOR', 'DEPARTMENT_HEAD')")
    public ResponseEntity<ApiResponse<java.util.Map<String, Object>>> verifyAuditChain() {
        return ResponseEntity.ok(ApiResponse.ok(auditService.verifyAuditChain()));
    }
}
