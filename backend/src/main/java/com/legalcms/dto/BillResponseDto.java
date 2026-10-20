package com.legalcms.dto;

import com.legalcms.enums.BillStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BillResponseDto {
    private Long id;
    private String billNo;
    private Long advocateId;
    private String advocateName;
    private String registrationRef;
    private Long caseId;
    private String internalCaseNo;
    private String courtCaseRef;
    private Long categoryId;
    private String categoryLabel;
    private BigDecimal claimedAmount;
    private BigDecimal approvedAmount;
    private BigDecimal paidAmount;
    private BigDecimal remainingBalance;
    private BillStatus status;
    private String billReference;
    private LocalDate claimDate;
    private LocalDate periodStart;
    private LocalDate periodEnd;
    private LocalDateTime submittedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Set<Long> hearingIds;
}
