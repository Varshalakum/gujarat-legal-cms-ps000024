package com.legalcms.dto;

import com.legalcms.enums.AttendanceStatus;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttendanceRecordRequest {

    @NotNull(message = "Advocate ID is required")
    private Long advocateId;

    @NotNull(message = "Attendance status is required")
    private AttendanceStatus status;

    private String sourceRef;

    private String notes;
}
