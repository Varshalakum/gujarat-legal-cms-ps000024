package com.legalcms.dto;

import jakarta.validation.constraints.NotEmpty;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BillVerificationRequest {

    @NotEmpty(message = "At least one verification check is required")
    private List<VerificationCheckItem> checks;

    private String overallComment;

    @Builder.Default
    private boolean markVerifiedIfAllPass = true;
}
