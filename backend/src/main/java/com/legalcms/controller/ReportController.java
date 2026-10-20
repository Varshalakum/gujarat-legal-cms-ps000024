package com.legalcms.controller;

import com.legalcms.dto.ApiResponse;
import com.legalcms.dto.BudgetUtilisationDto;
import com.legalcms.dto.ExpenditureReportDto;
import com.legalcms.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/expenditure")
    public ResponseEntity<ApiResponse<List<ExpenditureReportDto>>> getExpenditureReport() {
        List<ExpenditureReportDto> reports = reportService.getExpenditureReport();
        return ResponseEntity.ok(ApiResponse.ok(reports));
    }

    @GetMapping("/budget-utilisation")
    public ResponseEntity<ApiResponse<List<BudgetUtilisationDto>>> getBudgetUtilisation(
            @RequestParam(required = false) String financialYear
    ) {
        List<BudgetUtilisationDto> reports = reportService.getBudgetUtilisationReport(financialYear);
        return ResponseEntity.ok(ApiResponse.ok(reports));
    }
}
