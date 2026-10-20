package com.legalcms.dto;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BudgetUtilisationDto {
    private Long departmentId;
    private String departmentName;
    private String financialYear;
    private BigDecimal totalAllocated;
    private BigDecimal totalSpent;
    private BigDecimal balanceRemaining;
    private Double utilisationPercentage;
}
