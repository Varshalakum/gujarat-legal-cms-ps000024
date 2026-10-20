package com.legalcms.dto;

import com.legalcms.enums.PaymentMode;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentCreateRequest {

    @NotBlank(message = "Payment reference is required")
    private String paymentReference;

    @NotBlank(message = "Idempotency key is required")
    private String idempotencyKey;

    private BigDecimal grossAmount;

    private BigDecimal tdsAmount; // Income Tax TDS u/s 194J

    private BigDecimal gstTdsAmount; // GST TDS u/s 51

    private BigDecimal welfareFundAmount; // Advocate Welfare Fund

    @NotNull(message = "Net payment disbursement amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be greater than zero")
    private BigDecimal amount;

    @NotNull(message = "Payment date is required")
    private LocalDate paymentDate;

    @NotNull(message = "Payment mode is required")
    private PaymentMode mode;

    @NotBlank(message = "Voucher reference is required for accounting entry")
    private String voucherReference;

    @NotBlank(message = "Accounting head is required")
    private String accountingHead;

    @NotBlank(message = "Financial year is required (e.g. 2024-2025)")
    private String financialYear;
}
