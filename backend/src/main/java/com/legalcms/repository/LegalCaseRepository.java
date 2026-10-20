package com.legalcms.repository;

import com.legalcms.entity.LegalCase;
import com.legalcms.enums.CaseStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LegalCaseRepository extends JpaRepository<LegalCase, Long> {
    Optional<LegalCase> findByInternalCaseNo(String internalCaseNo);
    List<LegalCase> findByDepartmentId(Long departmentId);
    List<LegalCase> findByStatus(CaseStatus status);
}
