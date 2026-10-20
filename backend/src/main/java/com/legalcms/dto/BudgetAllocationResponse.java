package com.legalcms.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BudgetAllocationResponse {
    private Long id;
    private String financialYear;
    private Long departmentId;
    private String departmentName;
    private String budgetDimension;
    private BigDecimal allocatedAmount;
    private Integer version;
    private String approvedByName;
    private LocalDateTime createdAt;
}
