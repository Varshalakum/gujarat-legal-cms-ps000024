package com.legalcms.dto;

import com.legalcms.enums.PaymentMode;
import com.legalcms.enums.PaymentStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentResponseDto {
    private Long id;
    private Long billId;
    private String billNo;
    private String paymentReference;
    private String idempotencyKey;
    private BigDecimal grossAmount;
    private BigDecimal tdsAmount;
    private BigDecimal gstTdsAmount;
    private BigDecimal welfareFundAmount;
    private BigDecimal amount; // Net disbursed
    private LocalDate paymentDate;
    private PaymentMode mode;
    private PaymentStatus status;
    private String createdByName;
    private LocalDateTime createdAt;
    private String voucherReference;
    private String accountingHead;
    private String financialYear;
}
