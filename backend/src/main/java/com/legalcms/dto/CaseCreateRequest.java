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
public class CaseCreateRequest {

    @NotBlank(message = "Internal case number is required")
    private String internalCaseNo;

    @NotNull(message = "Court ID is required")
    private Long courtId;

    @NotBlank(message = "Court case reference is required")
    private String courtCaseRef;

    @NotNull(message = "Department ID is required")
    private Long departmentId;

    @NotBlank(message = "Case type is required")
    private String caseType;

    @NotBlank(message = "Subject is required")
    private String subject;

    private String priority;

    @NotNull(message = "Filing date is required")
    private LocalDate filingDate;
}
