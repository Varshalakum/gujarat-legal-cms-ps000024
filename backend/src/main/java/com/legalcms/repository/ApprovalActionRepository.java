package com.legalcms.repository;

import com.legalcms.entity.ApprovalAction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ApprovalActionRepository extends JpaRepository<ApprovalAction, Long> {
    List<ApprovalAction> findByTaskIdOrderByCreatedAtDesc(Long taskId);
    List<ApprovalAction> findByTaskBillIdOrderByCreatedAtDesc(Long billId);
}
