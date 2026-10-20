package com.legalcms.repository;

import com.legalcms.entity.BudgetAllocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface BudgetAllocationRepository extends JpaRepository<BudgetAllocation, Long> {
    List<BudgetAllocation> findByFinancialYear(String financialYear);
    List<BudgetAllocation> findByDepartmentId(Long departmentId);
    Optional<BudgetAllocation> findByDepartmentIdAndFinancialYear(Long departmentId, String financialYear);

    @Query("SELECT COALESCE(SUM(b.allocatedAmount), 0) FROM BudgetAllocation b WHERE b.department.id = :departmentId AND b.financialYear = :financialYear")
    BigDecimal getTotalAllocatedForDepartmentAndYear(
        @Param("departmentId") Long departmentId,
        @Param("financialYear") String financialYear
    );
}
