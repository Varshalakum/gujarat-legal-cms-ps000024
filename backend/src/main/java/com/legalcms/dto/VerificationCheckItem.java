package com.legalcms.dto;

import com.legalcms.enums.CheckResult;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VerificationCheckItem {
    @NotBlank(message = "Check code is required")
    private String checkCode;

    @NotNull(message = "Result is required")
    private CheckResult result;

    private String comment;
}
