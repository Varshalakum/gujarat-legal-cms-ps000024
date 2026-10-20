package com.legalcms.service;

import com.legalcms.dto.PaymentCreateRequest;
import com.legalcms.dto.PaymentResponseDto;
import com.legalcms.entity.*;
import com.legalcms.enums.BillStatus;
import com.legalcms.enums.PaymentMode;
import com.legalcms.enums.PaymentStatus;
import com.legalcms.exception.BusinessRuleException;
import com.legalcms.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PaymentServiceTest {

    @Mock
    private PaymentRepository paymentRepository;
    @Mock
    private PaymentAdjustmentRepository adjustmentRepository;
    @Mock
    private AccountingEntryRepository accountingEntryRepository;
    @Mock
    private BillRepository billRepository;
    @Mock
    private AuthService authService;
    @Mock
    private AuditService auditService;
    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private PaymentService paymentService;

    private Bill approvedBill;
    private User testOfficer;

    @BeforeEach
    void setUp() {
        User advUser = User.builder().id(101L).name("Advocate Trivedi").login("advocate1").build();
        Advocate advocate = Advocate.builder().id(1L).user(advUser).registrationRef("G/123/2012").build();
        LegalCase legalCase = LegalCase.builder().id(50L).internalCaseNo("CAS-2024-001").courtCaseRef("SCA/1024/2024").build();
        FeeCategory feeCategory = FeeCategory.builder().id(1L).code("HC_APPEARANCE").label("High Court Effective Appearance").build();

        approvedBill = Bill.builder()
                .id(10L)
                .billNo("BILL-2024-001")
                .advocate(advocate)
                .legalCase(legalCase)
                .category(feeCategory)
                .claimedAmount(new BigDecimal("10000.00"))
                .approvedAmount(new BigDecimal("10000.00"))
                .status(BillStatus.APPROVED)
                .build();

        testOfficer = User.builder()
                .id(201L)
                .name("Kirit Dave (Finance Officer)")
                .login("finance1")
                .build();
    }

    @Test
    @DisplayName("Should correctly compute multi-tier statutory deductions (IT TDS, GST TDS, Welfare Fund)")
    void testStatutoryDeductionsCalculation() {
        when(paymentRepository.findByIdempotencyKey("IDEM-001")).thenReturn(Optional.empty());
        when(paymentRepository.findByPaymentReference("PAY-REF-001")).thenReturn(Optional.empty());
        when(billRepository.findById(10L)).thenReturn(Optional.of(approvedBill));
        when(paymentRepository.getTotalPaidAmountForBill(10L)).thenReturn(BigDecimal.ZERO);
        when(authService.getCurrentUser()).thenReturn(testOfficer);

        // Disburse Gross ₹10,000 with 10% IT TDS (₹1,000), 2% GST TDS (₹200), and ₹100 Welfare Fund
        PaymentCreateRequest request = PaymentCreateRequest.builder()
                .paymentReference("PAY-REF-001")
                .idempotencyKey("IDEM-001")
                .grossAmount(new BigDecimal("10000.00"))
                .tdsAmount(new BigDecimal("1000.00"))
                .gstTdsAmount(new BigDecimal("200.00"))
                .welfareFundAmount(new BigDecimal("100.00"))
                .amount(new BigDecimal("8700.00")) // Net payable
                .paymentDate(LocalDate.now())
                .mode(PaymentMode.NEFT)
                .voucherReference("VOUCH-2024-001")
                .accountingHead("2014-00-114-01-00")
                .financialYear("2024-2025")
                .build();

        when(paymentRepository.save(any(Payment.class))).thenAnswer(invocation -> {
            Payment p = invocation.getArgument(0);
            p.setId(555L);
            return p;
        });

        PaymentResponseDto response = paymentService.recordPayment(10L, request);

        assertNotNull(response);
        assertEquals(new BigDecimal("10000.00"), response.getGrossAmount());
        assertEquals(new BigDecimal("1000.00"), response.getTdsAmount());
        assertEquals(new BigDecimal("200.00"), response.getGstTdsAmount());
        assertEquals(new BigDecimal("100.00"), response.getWelfareFundAmount());
        assertEquals(new BigDecimal("8700.00"), response.getAmount(), "Net payable must equal Gross minus all statutory deductions");

        verify(auditService, times(1)).recordEvent(any(), eq("FINANCE_OFFICER"), eq("RECORD_PAYMENT"), eq("Payment"), eq(555L), anyString(), anyString());
    }

    @Test
    @DisplayName("Should reject payment if bill status is not APPROVED")
    void testRejectPaymentOnNonApprovedBill() {
        approvedBill.setStatus(BillStatus.PENDING_VERIFICATION);
        when(billRepository.findById(10L)).thenReturn(Optional.of(approvedBill));

        PaymentCreateRequest request = PaymentCreateRequest.builder()
                .paymentReference("PAY-REF-002")
                .idempotencyKey("IDEM-002")
                .grossAmount(new BigDecimal("5000.00"))
                .amount(new BigDecimal("5000.00"))
                .paymentDate(LocalDate.now())
                .mode(PaymentMode.NEFT)
                .voucherReference("V-002")
                .accountingHead("2014-00-114-01-00")
                .financialYear("2024-2025")
                .build();

        BusinessRuleException ex = assertThrows(BusinessRuleException.class, () ->
                paymentService.recordPayment(10L, request)
        );

        assertTrue(ex.getMessage().contains("Only APPROVED bills can receive payments"));
        verify(paymentRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should prevent overpayment if gross amount exceeds remaining approved balance")
    void testPreventOverpayment() {
        when(billRepository.findById(10L)).thenReturn(Optional.of(approvedBill));
        // Already paid ₹8,000 out of ₹10,000 approved
        when(paymentRepository.getTotalPaidAmountForBill(10L)).thenReturn(new BigDecimal("8000.00"));

        PaymentCreateRequest request = PaymentCreateRequest.builder()
                .paymentReference("PAY-REF-003")
                .idempotencyKey("IDEM-003")
                .grossAmount(new BigDecimal("3000.00")) // Exceeds remaining ₹2,000
                .amount(new BigDecimal("3000.00"))
                .paymentDate(LocalDate.now())
                .mode(PaymentMode.NEFT)
                .voucherReference("V-003")
                .accountingHead("2014-00-114-01-00")
                .financialYear("2024-2025")
                .build();

        BusinessRuleException ex = assertThrows(BusinessRuleException.class, () ->
                paymentService.recordPayment(10L, request)
        );

        assertTrue(ex.getMessage().contains("Overpayment prevented"));
        verify(paymentRepository, never()).save(any());
    }
}
