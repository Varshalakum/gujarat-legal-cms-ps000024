package com.legalcms.repository;

import com.legalcms.entity.CaseAdvocateAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CaseAdvocateAssignmentRepository extends JpaRepository<CaseAdvocateAssignment, Long> {
    List<CaseAdvocateAssignment> findByLegalCaseId(Long caseId);
    List<CaseAdvocateAssignment> findByAdvocateId(Long advocateId);
}
