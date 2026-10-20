package com.legalcms.dto;

import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdvocateAssignmentResponseDto {
    private Long id;
    private Long caseId;
    private Long advocateId;
    private String advocateName;
    private String registrationRef;
    private String role;
    private LocalDate validFrom;
    private LocalDate validTo;
    private String reason;
    private String changedByName;
    private LocalDateTime createdAt;
}
