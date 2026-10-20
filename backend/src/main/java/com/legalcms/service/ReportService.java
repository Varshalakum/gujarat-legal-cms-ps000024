package com.legalcms.service;

import com.legalcms.dto.BudgetUtilisationDto;
import com.legalcms.dto.ExpenditureReportDto;
import com.legalcms.entity.Bill;
import com.legalcms.entity.Department;
import com.legalcms.enums.BillStatus;
import com.legalcms.repository.BillRepository;
import com.legalcms.repository.DepartmentRepository;
import com.legalcms.repository.LegalCaseRepository;
import com.legalcms.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReportService {

    private final DepartmentRepository departmentRepository;
    private final LegalCaseRepository legalCaseRepository;
    private final BillRepository billRepository;
    private final PaymentRepository paymentRepository;
    private final BudgetService budgetService;

    @Transactional(readOnly = true)
    public List<ExpenditureReportDto> getExpenditureReport() {
        List<Department> departments = departmentRepository.findAll();
        List<ExpenditureReportDto> reports = new ArrayList<>();

        for (Department dept : departments) {
            long totalCases = legalCaseRepository.findByDepartmentId(dept.getId()).size();
            List<Bill> allBills = billRepository.findAll().stream()
                    .filter(b -> b.getLegalCase().getDepartment().getId().equals(dept.getId()))
                    .toList();

            long totalSubmitted = allBills.size();
            long totalApproved = allBills.stream()
                    .filter(b -> b.getStatus() == BillStatus.APPROVED)
                    .count();

            BigDecimal totalClaimed = allBills.stream()
                    .map(Bill::getClaimedAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            BigDecimal totalApprovedAmt = allBills.stream()
                    .filter(b -> b.getApprovedAmount() != null)
                    .map(Bill::getApprovedAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            BigDecimal totalPaid = paymentRepository.getTotalExpenditureByDepartment(dept.getId());
            if (totalPaid == null) totalPaid = BigDecimal.ZERO;

            reports.add(ExpenditureReportDto.builder()
                    .departmentId(dept.getId())
                    .departmentName(dept.getName())
                    .totalCases(totalCases)
                    .totalBillsSubmitted(totalSubmitted)
                    .totalBillsApproved(totalApproved)
                    .totalAmountClaimed(totalClaimed)
                    .totalAmountApproved(totalApprovedAmt)
                    .totalAmountPaid(totalPaid)
                    .build());
        }

        return reports;
    }

    @Transactional(readOnly = true)
    public List<BudgetUtilisationDto> getBudgetUtilisationReport(String financialYear) {
        return budgetService.getBudgetUtilisation(financialYear);
    }
}
