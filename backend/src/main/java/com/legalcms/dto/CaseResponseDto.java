package com.legalcms.dto;

import com.legalcms.enums.CaseStatus;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CaseResponseDto {
    private Long id;
    private String internalCaseNo;
    private Long courtId;
    private String courtName;
    private String courtLevel;
    private String courtCaseRef;
    private Long departmentId;
    private String departmentName;
    private String caseType;
    private String subject;
    private CaseStatus status;
    private String priority;
    private LocalDate filingDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
