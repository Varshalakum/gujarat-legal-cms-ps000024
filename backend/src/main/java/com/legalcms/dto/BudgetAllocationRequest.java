package com.legalcms.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BudgetAllocationRequest {

    @NotBlank(message = "Financial year is required (e.g. 2024-2025)")
    private String financialYear;

    @NotNull(message = "Department ID is required")
    private Long departmentId;

    @NotBlank(message = "Budget dimension is required")
    private String budgetDimension;

    @NotNull(message = "Allocated amount is required")
    @DecimalMin(value = "0.01", message = "Allocated amount must be greater than zero")
    private BigDecimal allocatedAmount;
}
