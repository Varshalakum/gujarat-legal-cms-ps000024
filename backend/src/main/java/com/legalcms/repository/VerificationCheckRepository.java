package com.legalcms.repository;

import com.legalcms.entity.VerificationCheck;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VerificationCheckRepository extends JpaRepository<VerificationCheck, Long> {
    List<VerificationCheck> findByBillId(Long billId);
}
