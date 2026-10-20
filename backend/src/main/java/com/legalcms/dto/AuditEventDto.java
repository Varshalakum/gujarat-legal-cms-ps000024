package com.legalcms.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditEventDto {
    private Long id;
    private Long actorId;
    private String actorName;
    private String roleCode;
    private String action;
    private String entityType;
    private Long entityId;
    private String beforeAfterSummary;
    private String reason;
    private LocalDateTime createdAt;
    private String requestId;
}
