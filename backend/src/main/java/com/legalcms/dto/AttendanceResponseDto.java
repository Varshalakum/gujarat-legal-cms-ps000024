package com.legalcms.dto;

import com.legalcms.enums.AttendanceStatus;
import com.legalcms.enums.VerificationStatus;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttendanceResponseDto {
    private Long id;
    private Long hearingId;
    private Long advocateId;
    private String advocateName;
    private String registrationRef;
    private AttendanceStatus status;
    private VerificationStatus verificationStatus;
    private String sourceRef;
    private String notes;
    private String enteredByName;
    private LocalDateTime enteredAt;
}
