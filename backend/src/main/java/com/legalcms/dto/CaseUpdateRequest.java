package com.legalcms.dto;

import com.legalcms.enums.CaseStatus;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CaseUpdateRequest {
    private String courtCaseRef;
    private String caseType;
    private String subject;
    private CaseStatus status;
    private String priority;
}
