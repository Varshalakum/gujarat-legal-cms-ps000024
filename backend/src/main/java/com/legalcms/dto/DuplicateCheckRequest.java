package com.legalcms.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DuplicateCheckRequest {

    @NotNull(message = "Advocate ID is required")
    private Long advocateId;

    @NotNull(message = "Case ID is required")
    private Long caseId;

    @NotNull(message = "Claim date is required")
    private LocalDate claimDate;

    private Set<Long> hearingIds;
}
