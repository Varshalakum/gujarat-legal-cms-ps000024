package com.legalcms.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdvocateAssignmentRequest {

    @NotNull(message = "Advocate ID is required")
    private Long advocateId;

    @NotBlank(message = "Role is required (e.g. LEAD_COUNSEL, ASSOCIATE)")
    private String role;

    @NotNull(message = "Valid from date is required")
    private LocalDate validFrom;

    private LocalDate validTo;

    private String reason;
}
