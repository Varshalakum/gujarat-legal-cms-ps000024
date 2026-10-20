package com.legalcms.dto;

import com.legalcms.enums.HearingOutcome;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HearingUpdateRequest {
    private LocalDateTime scheduledAt;
    private HearingOutcome outcome;
    private LocalDateTime nextHearingAt;
    private String postponementReason;
    private String notes;
    private String rescheduleReason; // For logging into hearing_change_events if scheduledAt changes
}
