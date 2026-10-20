package com.legalcms.dto;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExpenditureReportDto {
    private Long departmentId;
    private String departmentName;
    private Long totalCases;
    private Long totalBillsSubmitted;
    private Long totalBillsApproved;
    private BigDecimal totalAmountClaimed;
    private BigDecimal totalAmountApproved;
    private BigDecimal totalAmountPaid;
}
