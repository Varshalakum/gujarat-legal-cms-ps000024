package com.legalcms.service;

import com.legalcms.dto.PaymentAdjustmentRequest;
import com.legalcms.dto.PaymentCreateRequest;
import com.legalcms.dto.PaymentResponseDto;
import com.legalcms.entity.*;
import com.legalcms.enums.BillStatus;
import com.legalcms.enums.PaymentStatus;
import com.legalcms.exception.BusinessRuleException;
import com.legalcms.exception.ResourceNotFoundException;
import com.legalcms.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final PaymentAdjustmentRepository adjustmentRepository;
    private final AccountingEntryRepository accountingEntryRepository;
    private final BillRepository billRepository;
    private final AuthService authService;
    private final AuditService auditService;
    private final NotificationService notificationService;

    /**
     * Records a payment against an approved bill.
     * Uses SERIALIZABLE or REPEATABLE_READ isolation within a strict database transaction
     * to prevent race conditions and overpayment.
     */
    @Transactional(rollbackFor = Exception.class, isolation = Isolation.REPEATABLE_READ)
    public PaymentResponseDto recordPayment(Long billId, PaymentCreateRequest request) {
        // 1. Idempotency Check: if idempotency_key already processed, return existing payment
        Optional<Payment> existingPaymentOpt = paymentRepository.findByIdempotencyKey(request.getIdempotencyKey());
        if (existingPaymentOpt.isPresent()) {
            log.info("Idempotent payment request detected with key: {}", request.getIdempotencyKey());
            return mapToDto(existingPaymentOpt.get());
        }

        if (paymentRepository.findByPaymentReference(request.getPaymentReference()).isPresent()) {
            throw new BusinessRuleException("Payment reference '" + request.getPaymentReference() + "' already exists");
        }

        Bill bill = billRepository.findById(billId)
                .orElseThrow(() -> new ResourceNotFoundException("Bill not found with id: " + billId));

        // 2. Validate Bill Status
        if (bill.getStatus() != BillStatus.APPROVED) {
            throw new BusinessRuleException("Cannot disburse payment: Bill " + bill.getBillNo() + " is currently in status " + bill.getStatus() + ". Only APPROVED bills can receive payments.");
        }

        if (bill.getApprovedAmount() == null || bill.getApprovedAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessRuleException("Cannot disburse payment: Bill approved amount is not set or zero");
        }

        // 3. Balance Check: Prevent Overpayment
        BigDecimal alreadyPaid = paymentRepository.getTotalPaidAmountForBill(billId);
        if (alreadyPaid == null) {
            alreadyPaid = BigDecimal.ZERO;
        }

        BigDecimal remainingBalance = bill.getApprovedAmount().subtract(alreadyPaid);
        BigDecimal grossAmount = request.getGrossAmount() != null ? request.getGrossAmount() : (request.getAmount() != null ? request.getAmount() : bill.getApprovedAmount());

        if (grossAmount.compareTo(remainingBalance) > 0) {
            throw new BusinessRuleException("Overpayment prevented! Gross disbursement amount (" + grossAmount +
                    ") exceeds remaining approved balance (" + remainingBalance + "). Total approved: " +
                    bill.getApprovedAmount() + ", already paid: " + alreadyPaid);
        }

        // 4. Calculate Statutory Deductions
        BigDecimal tds = request.getTdsAmount() != null ? request.getTdsAmount() : BigDecimal.ZERO;
        BigDecimal gstTds = request.getGstTdsAmount() != null ? request.getGstTdsAmount() : BigDecimal.ZERO;
        BigDecimal welfareFund = request.getWelfareFundAmount() != null ? request.getWelfareFundAmount() : BigDecimal.ZERO;

        BigDecimal totalDeductions = tds.add(gstTds).add(welfareFund);
        BigDecimal netAmount = grossAmount.subtract(totalDeductions);
        if (netAmount.compareTo(BigDecimal.ZERO) < 0) {
            throw new BusinessRuleException("Invalid deductions: Total statutory deductions (" + totalDeductions + ") exceed gross amount (" + grossAmount + ")");
        }

        User currentUser = authService.getCurrentUser();

        // 5. Record Payment with Deductions
        Payment payment = Payment.builder()
                .bill(bill)
                .paymentReference(request.getPaymentReference())
                .idempotencyKey(request.getIdempotencyKey())
                .grossAmount(grossAmount)
                .tdsAmount(tds)
                .gstTdsAmount(gstTds)
                .welfareFundAmount(welfareFund)
                .amount(netAmount)
                .paymentDate(request.getPaymentDate())
                .mode(request.getMode())
                .status(PaymentStatus.RECORDED)
                .createdBy(currentUser)
                .build();

        Payment savedPayment = paymentRepository.save(payment);

        // 6. Record Accounting Entry
        AccountingEntry accountingEntry = AccountingEntry.builder()
                .payment(savedPayment)
                .voucherReference(request.getVoucherReference())
                .accountingHead(request.getAccountingHead())
                .financialYear(request.getFinancialYear())
                .enteredBy(currentUser)
                .build();

        accountingEntryRepository.save(accountingEntry);

        // 7. Append-only Audit Trail
        auditService.recordEvent(
                currentUser,
                "FINANCE_OFFICER",
                "RECORD_PAYMENT",
                "Payment",
                savedPayment.getId(),
                "Disbursed Gross=" + grossAmount + ", Net=" + netAmount + " (IT TDS=" + tds + ", GST TDS=" + gstTds + ", Welfare=" + welfareFund + ") via " + savedPayment.getMode() + " for bill " + bill.getBillNo(),
                "Voucher: " + request.getVoucherReference()
        );

        // 8. Notification
        notificationService.sendNotification(bill.getAdvocate().getUser(), "PAYMENT_PROCESSED", "Payment", savedPayment.getId());

        return mapToDto(savedPayment);
    }

    @Transactional(rollbackFor = Exception.class)
    public PaymentResponseDto adjustPayment(Long paymentId, PaymentAdjustmentRequest request) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found with id: " + paymentId));

        User currentUser = authService.getCurrentUser();

        PaymentAdjustment adjustment = PaymentAdjustment.builder()
                .originalPayment(payment)
                .adjustmentType(request.getAdjustmentType())
                .amount(request.getAmount())
                .reason(request.getReason())
                .actor(currentUser)
                .build();

        adjustmentRepository.save(adjustment);

        // Update payment status
        payment.setStatus(PaymentStatus.ADJUSTED);
        Payment updatedPayment = paymentRepository.save(payment);

        auditService.recordEvent(
                currentUser,
                "FINANCE_OFFICER",
                "ADJUST_PAYMENT",
                "PaymentAdjustment",
                adjustment.getId(),
                "Payment " + payment.getPaymentReference() + " adjusted with " + request.getAdjustmentType() + " amount " + request.getAmount(),
                request.getReason()
        );

        return mapToDto(updatedPayment);
    }

    @Transactional(readOnly = true)
    public List<PaymentResponseDto> getPaymentsForBill(Long billId) {
        return paymentRepository.findByBillId(billId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PaymentResponseDto getPaymentById(Long id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found with id: " + id));
        return mapToDto(payment);
    }

    private PaymentResponseDto mapToDto(Payment payment) {
        Optional<AccountingEntry> entryOpt = accountingEntryRepository.findByPaymentId(payment.getId()).stream().findFirst();

        return PaymentResponseDto.builder()
                .id(payment.getId())
                .billId(payment.getBill().getId())
                .billNo(payment.getBill().getBillNo())
                .paymentReference(payment.getPaymentReference())
                .idempotencyKey(payment.getIdempotencyKey())
                .grossAmount(payment.getGrossAmount() != null ? payment.getGrossAmount() : payment.getAmount())
                .tdsAmount(payment.getTdsAmount())
                .gstTdsAmount(payment.getGstTdsAmount())
                .welfareFundAmount(payment.getWelfareFundAmount())
                .amount(payment.getAmount())
                .paymentDate(payment.getPaymentDate())
                .mode(payment.getMode())
                .status(payment.getStatus())
                .createdByName(payment.getCreatedBy() != null ? payment.getCreatedBy().getName() : null)
                .createdAt(payment.getCreatedAt())
                .voucherReference(entryOpt.map(AccountingEntry::getVoucherReference).orElse(null))
                .accountingHead(entryOpt.map(AccountingEntry::getAccountingHead).orElse(null))
                .financialYear(entryOpt.map(AccountingEntry::getFinancialYear).orElse(null))
                .build();
    }
}
