package com.legalcms.dto;

import com.legalcms.enums.ApprovalDecision;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkflowActionRequest {

    private Long taskId; // optional if active task is resolved automatically

    @NotNull(message = "Approval decision is required")
    private ApprovalDecision decision; // APPROVE, RETURN, REJECT

    private String comment;

    private BigDecimal approvedAmount; // optional override upon final approval

    private Boolean isDigitallySigned;

    private String signatureCertificate;

    private String signatureDigest;
}
