package com.legalcms.controller;

import com.legalcms.dto.ApiResponse;
import com.legalcms.dto.PaymentAdjustmentRequest;
import com.legalcms.dto.PaymentResponseDto;
import com.legalcms.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PaymentResponseDto>> getPaymentById(@PathVariable Long id) {
        PaymentResponseDto response = paymentService.getPaymentById(id);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/bill/{billId}")
    public ResponseEntity<ApiResponse<List<PaymentResponseDto>>> getPaymentsForBill(@PathVariable Long billId) {
        List<PaymentResponseDto> list = paymentService.getPaymentsForBill(billId);
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @PostMapping("/{id}/adjustments")
    public ResponseEntity<ApiResponse<PaymentResponseDto>> adjustPayment(
            @PathVariable Long id,
            @Valid @RequestBody PaymentAdjustmentRequest request
    ) {
        PaymentResponseDto response = paymentService.adjustPayment(id, request);
        return ResponseEntity.ok(ApiResponse.ok(response, "Payment adjusted successfully"));
    }
}
