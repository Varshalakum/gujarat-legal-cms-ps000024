package com.legalcms.repository;

import com.legalcms.entity.Hearing;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HearingRepository extends JpaRepository<Hearing, Long> {
    List<Hearing> findByLegalCaseIdOrderByScheduledAtDesc(Long caseId);
}
