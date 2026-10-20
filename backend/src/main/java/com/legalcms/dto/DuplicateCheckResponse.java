package com.legalcms.dto;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DuplicateCheckResponse {
    private boolean duplicate;
    private String message;
    private List<Long> conflictingBillIds;
    private List<Long> conflictingHearingIds;
}
