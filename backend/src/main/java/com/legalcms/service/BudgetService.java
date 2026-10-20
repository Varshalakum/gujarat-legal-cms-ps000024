package com.legalcms.service;

import com.legalcms.dto.BudgetAllocationRequest;
import com.legalcms.dto.BudgetAllocationResponse;
import com.legalcms.dto.BudgetUtilisationDto;
import com.legalcms.entity.BudgetAllocation;
import com.legalcms.entity.Department;
import com.legalcms.entity.User;
import com.legalcms.exception.ResourceNotFoundException;
import com.legalcms.repository.BudgetAllocationRepository;
import com.legalcms.repository.DepartmentRepository;
import com.legalcms.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class BudgetService {

    private final BudgetAllocationRepository budgetAllocationRepository;
    private final DepartmentRepository departmentRepository;
    private final PaymentRepository paymentRepository;
    private final AuthService authService;
    private final AuditService auditService;

    @Transactional
    public BudgetAllocationResponse createOrUpdateAllocation(BudgetAllocationRequest request) {
        Department department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + request.getDepartmentId()));

        User currentUser = authService.getCurrentUser();

        BudgetAllocation allocation = budgetAllocationRepository
                .findByDepartmentIdAndFinancialYear(request.getDepartmentId(), request.getFinancialYear())
                .orElse(BudgetAllocation.builder()
                        .department(department)
                        .financialYear(request.getFinancialYear())
                        .budgetDimension(request.getBudgetDimension())
                        .version(1)
                        .build());

        if (allocation.getId() != null) {
            allocation.setVersion(allocation.getVersion() + 1);
            allocation.setAllocatedAmount(request.getAllocatedAmount());
            allocation.setBudgetDimension(request.getBudgetDimension());
        } else {
            allocation.setAllocatedAmount(request.getAllocatedAmount());
        }

        allocation.setApprovedBy(currentUser);
        BudgetAllocation saved = budgetAllocationRepository.save(allocation);

        auditService.recordEvent(
                currentUser,
                "FINANCE_OFFICER",
                "ALLOCATE_BUDGET",
                "BudgetAllocation",
                saved.getId(),
                "Allocated " + saved.getAllocatedAmount() + " to " + department.getName() + " for FY " + saved.getFinancialYear(),
                "Budget configuration"
        );

        return mapToDto(saved);
    }

    @Transactional(readOnly = true)
    public List<BudgetAllocationResponse> getAllocations(String financialYear, Long departmentId) {
        List<BudgetAllocation> allocations;
        if (departmentId != null) {
            allocations = budgetAllocationRepository.findByDepartmentId(departmentId);
        } else if (financialYear != null) {
            allocations = budgetAllocationRepository.findByFinancialYear(financialYear);
        } else {
            allocations = budgetAllocationRepository.findAll();
        }
        return allocations.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<BudgetUtilisationDto> getBudgetUtilisation(String financialYear) {
        String fy = financialYear != null ? financialYear : "2024-2025";
        List<Department> departments = departmentRepository.findAll();
        List<BudgetUtilisationDto> results = new ArrayList<>();

        for (Department dept : departments) {
            BigDecimal allocated = budgetAllocationRepository.getTotalAllocatedForDepartmentAndYear(dept.getId(), fy);
            BigDecimal spent = paymentRepository.getTotalExpenditureByDepartment(dept.getId());
            if (spent == null) spent = BigDecimal.ZERO;

            BigDecimal balance = allocated.subtract(spent);
            double percentage = 0.0;
            if (allocated.compareTo(BigDecimal.ZERO) > 0) {
                percentage = spent.divide(allocated, 4, RoundingMode.HALF_UP).doubleValue() * 100.0;
            }

            results.add(BudgetUtilisationDto.builder()
                    .departmentId(dept.getId())
                    .departmentName(dept.getName())
                    .financialYear(fy)
                    .totalAllocated(allocated)
                    .totalSpent(spent)
                    .balanceRemaining(balance)
                    .utilisationPercentage(percentage)
                    .build());
        }

        return results;
    }

    @Transactional(readOnly = true)
    public boolean checkBudgetAvailability(Long departmentId, String financialYear, BigDecimal requiredAmount) {
        String fy = financialYear != null ? financialYear : "2024-2025";
        BigDecimal allocated = budgetAllocationRepository.getTotalAllocatedForDepartmentAndYear(departmentId, fy);
        BigDecimal spent = paymentRepository.getTotalExpenditureByDepartment(departmentId);
        if (spent == null) spent = BigDecimal.ZERO;
        BigDecimal freeBalance = allocated.subtract(spent);
        return freeBalance.compareTo(requiredAmount) >= 0;
    }

    public BudgetAllocationResponse mapToDto(BudgetAllocation b) {
        return BudgetAllocationResponse.builder()
                .id(b.getId())
                .financialYear(b.getFinancialYear())
                .departmentId(b.getDepartment().getId())
                .departmentName(b.getDepartment().getName())
                .budgetDimension(b.getBudgetDimension())
                .allocatedAmount(b.getAllocatedAmount())
                .version(b.getVersion())
                .approvedByName(b.getApprovedBy() != null ? b.getApprovedBy().getName() : null)
                .createdAt(b.getCreatedAt())
                .build();
    }
}
