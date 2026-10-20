package com.legalcms.dto;

import com.legalcms.enums.HearingOutcome;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HearingCreateRequest {

    @NotNull(message = "Court ID is required")
    private Long courtId;

    @NotNull(message = "Scheduled date/time is required")
    private LocalDateTime scheduledAt;

    private HearingOutcome outcome;

    private LocalDateTime nextHearingAt;

    private String postponementReason;

    private String notes;
}
