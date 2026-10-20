package com.legalcms.dto;

import com.legalcms.enums.HearingOutcome;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HearingResponseDto {
    private Long id;
    private Long caseId;
    private String internalCaseNo;
    private Long courtId;
    private String courtName;
    private LocalDateTime scheduledAt;
    private HearingOutcome outcome;
    private LocalDateTime nextHearingAt;
    private String postponementReason;
    private String notes;
    private String enteredByName;
    private LocalDateTime createdAt;
}
