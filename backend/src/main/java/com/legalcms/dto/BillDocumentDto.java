package com.legalcms.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BillDocumentDto {
    private Long id;
    private Long billId;
    private String originalFilename;
    private String mimeType;
    private Long sizeBytes;
    private String documentType;
    private String checksumSha256;
    private Boolean duplicateDetected;
    private String uploadedByName;
    private LocalDateTime uploadedAt;
}
