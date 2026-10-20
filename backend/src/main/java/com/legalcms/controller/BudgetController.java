package com.legalcms.controller;

import com.legalcms.dto.ApiResponse;
import com.legalcms.dto.BudgetAllocationRequest;
import com.legalcms.dto.BudgetAllocationResponse;
import com.legalcms.service.BudgetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/budgets")
@RequiredArgsConstructor
public class BudgetController {

    private final BudgetService budgetService;

    @PostMapping("/allocations")
    public ResponseEntity<ApiResponse<BudgetAllocationResponse>> createAllocation(
            @Valid @RequestBody BudgetAllocationRequest request
    ) {
        BudgetAllocationResponse response = budgetService.createOrUpdateAllocation(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(response, "Budget allocated successfully"));
    }

    @GetMapping("/allocations")
    public ResponseEntity<ApiResponse<List<BudgetAllocationResponse>>> getAllocations(
            @RequestParam(required = false) String financialYear,
            @RequestParam(required = false) Long departmentId
    ) {
        List<BudgetAllocationResponse> list = budgetService.getAllocations(financialYear, departmentId);
        return ResponseEntity.ok(ApiResponse.ok(list));
    }
}
