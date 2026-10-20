package com.legalcms.controller;

import com.legalcms.dto.*;
import com.legalcms.enums.BillStatus;
import com.legalcms.service.BillService;
import com.legalcms.service.PaymentService;
import com.legalcms.service.WorkflowService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/bills")
@RequiredArgsConstructor
public class BillController {

    private final BillService billService;
    private final WorkflowService workflowService;
    private final PaymentService paymentService;

    @PostMapping
    public ResponseEntity<ApiResponse<BillResponseDto>> createBill(@Valid @RequestBody BillCreateRequest request) {
        BillResponseDto response = billService.createBill(request);
        // Automatically route to initial workflow stage
        workflowService.submitToWorkflow(response.getId());
        BillResponseDto refreshed = billService.getBillById(response.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(refreshed, "Bill created and submitted into verification workflow"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<BillResponseDto>>> getAllBills(
            @RequestParam(required = false) Long advocateId,
            @RequestParam(required = false) Long caseId,
            @RequestParam(required = false) BillStatus status
    ) {
        List<BillResponseDto> bills = billService.getAllBills(advocateId, caseId, status);
        return ResponseEntity.ok(ApiResponse.ok(bills));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BillResponseDto>> getBillById(@PathVariable Long id) {
        BillResponseDto response = billService.getBillById(id);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PostMapping(value = "/{id}/documents", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<BillDocumentDto>> uploadDocument(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "documentType", defaultValue = "SUPPORTING_DOC") String documentType
    ) throws IOException {
        BillDocumentDto response = billService.uploadDocument(id, file, documentType);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(response, "Document uploaded successfully"));
    }

    @GetMapping("/{id}/documents")
    public ResponseEntity<ApiResponse<List<BillDocumentDto>>> getDocuments(@PathVariable Long id) {
        List<BillDocumentDto> documents = billService.getBillDocuments(id);
        return ResponseEntity.ok(ApiResponse.ok(documents));
    }

    @PostMapping("/{id}/duplicate-check")
    public ResponseEntity<ApiResponse<DuplicateCheckResponse>> duplicateCheck(
            @PathVariable Long id,
            @RequestBody DuplicateCheckRequest request
    ) {
        BillResponseDto bill = billService.getBillById(id);
        DuplicateCheckRequest checkReq = DuplicateCheckRequest.builder()
                .advocateId(request.getAdvocateId() != null ? request.getAdvocateId() : bill.getAdvocateId())
                .caseId(request.getCaseId() != null ? request.getCaseId() : bill.getCaseId())
                .claimDate(request.getClaimDate() != null ? request.getClaimDate() : bill.getClaimDate())
                .hearingIds(request.getHearingIds() != null ? request.getHearingIds() : bill.getHearingIds())
                .build();

        DuplicateCheckResponse response = billService.checkDuplicate(checkReq);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PostMapping("/{id}/verify")
    public ResponseEntity<ApiResponse<BillResponseDto>> verifyBill(
            @PathVariable Long id,
            @Valid @RequestBody BillVerificationRequest request
    ) {
        BillResponseDto response = workflowService.performVerification(id, request);
        return ResponseEntity.ok(ApiResponse.ok(response, "Bill verification processed"));
    }

    @PostMapping("/{id}/workflow-actions")
    public ResponseEntity<ApiResponse<BillResponseDto>> workflowAction(
            @PathVariable Long id,
            @Valid @RequestBody WorkflowActionRequest request
    ) {
        BillResponseDto response = workflowService.processWorkflowAction(id, request);
        return ResponseEntity.ok(ApiResponse.ok(response, "Workflow action applied successfully"));
    }

    @PostMapping("/{id}/payments")
    public ResponseEntity<ApiResponse<PaymentResponseDto>> recordPayment(
            @PathVariable Long id,
            @Valid @RequestBody PaymentCreateRequest request
    ) {
        PaymentResponseDto response = paymentService.recordPayment(id, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(response, "Payment recorded successfully"));
    }
}
