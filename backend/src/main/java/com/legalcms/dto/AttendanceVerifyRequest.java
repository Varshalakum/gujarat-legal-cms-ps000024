package com.legalcms.dto;

import com.legalcms.enums.VerificationStatus;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttendanceVerifyRequest {

    @NotNull(message = "Verification status is required")
    private VerificationStatus verificationStatus;

    private String notes;
}
