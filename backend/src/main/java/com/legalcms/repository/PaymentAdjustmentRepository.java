package com.legalcms.repository;

import com.legalcms.entity.PaymentAdjustment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaymentAdjustmentRepository extends JpaRepository<PaymentAdjustment, Long> {
    List<PaymentAdjustment> findByOriginalPaymentId(Long paymentId);
}
