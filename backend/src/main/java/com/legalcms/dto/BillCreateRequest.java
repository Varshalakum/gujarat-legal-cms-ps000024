package com.legalcms.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BillCreateRequest {

    @NotNull(message = "Advocate ID is required")
    private Long advocateId;

    @NotNull(message = "Case ID is required")
    private Long caseId;

    private String billReference;

    @NotNull(message = "Claim date is required")
    private LocalDate claimDate;

    private LocalDate periodStart;

    private LocalDate periodEnd;

    @NotNull(message = "Fee category ID is required")
    private Long categoryId;

    @NotNull(message = "Claimed amount is required")
    @DecimalMin(value = "0.01", message = "Claimed amount must be greater than zero")
    private BigDecimal claimedAmount;

    private Set<Long> hearingIds;
}
