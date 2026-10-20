package com.legalcms.controller;

import com.legalcms.dto.*;
import com.legalcms.enums.CaseStatus;
import com.legalcms.service.CaseService;
import com.legalcms.service.HearingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cases")
@RequiredArgsConstructor
public class CaseController {

    private final CaseService caseService;
    private final HearingService hearingService;

    @PostMapping
    public ResponseEntity<ApiResponse<CaseResponseDto>> createCase(@Valid @RequestBody CaseCreateRequest request) {
        CaseResponseDto response = caseService.createCase(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(response, "Case created successfully"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<CaseResponseDto>>> getAllCases(
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) CaseStatus status
    ) {
        List<CaseResponseDto> cases = caseService.getAllCases(departmentId, status);
        return ResponseEntity.ok(ApiResponse.ok(cases));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CaseResponseDto>> getCaseById(@PathVariable Long id) {
        CaseResponseDto response = caseService.getCaseById(id);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse<CaseResponseDto>> updateCase(
            @PathVariable Long id,
            @RequestBody CaseUpdateRequest request
    ) {
        CaseResponseDto response = caseService.updateCase(id, request);
        return ResponseEntity.ok(ApiResponse.ok(response, "Case updated successfully"));
    }

    @PostMapping("/{id}/advocate-assignments")
    public ResponseEntity<ApiResponse<AdvocateAssignmentResponseDto>> assignAdvocate(
            @PathVariable Long id,
            @Valid @RequestBody AdvocateAssignmentRequest request
    ) {
        AdvocateAssignmentResponseDto response = caseService.assignAdvocate(id, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(response, "Advocate assigned successfully"));
    }

    @GetMapping("/{id}/advocate-assignments")
    public ResponseEntity<ApiResponse<List<AdvocateAssignmentResponseDto>>> getAdvocateAssignments(@PathVariable Long id) {
        List<AdvocateAssignmentResponseDto> assignments = caseService.getAdvocateAssignments(id);
        return ResponseEntity.ok(ApiResponse.ok(assignments));
    }

    @GetMapping("/{id}/hearings")
    public ResponseEntity<ApiResponse<List<HearingResponseDto>>> getCaseHearings(@PathVariable Long id) {
        List<HearingResponseDto> hearings = hearingService.getHearingsForCase(id);
        return ResponseEntity.ok(ApiResponse.ok(hearings));
    }

    @PostMapping("/{id}/hearings")
    public ResponseEntity<ApiResponse<HearingResponseDto>> createHearing(
            @PathVariable Long id,
            @Valid @RequestBody HearingCreateRequest request
    ) {
        HearingResponseDto response = hearingService.createHearing(id, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(response, "Hearing scheduled successfully"));
    }
}
