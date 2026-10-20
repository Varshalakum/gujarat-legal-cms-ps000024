package com.legalcms.dto;

import com.legalcms.enums.RoleCode;
import com.legalcms.enums.TaskStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApprovalInboxDto {
    private Long taskId;
    private Long billId;
    private String billNo;
    private String advocateName;
    private String registrationRef;
    private String caseNumber;
    private String caseSubject;
    private BigDecimal claimedAmount;
    private BigDecimal approvedAmount;
    private Integer stageOrder;
    private RoleCode requiredRole;
    private BigDecimal stageAuthorityLimit;
    private LocalDateTime enteredAt;
    private LocalDateTime dueAt;
    private TaskStatus taskStatus;
}
