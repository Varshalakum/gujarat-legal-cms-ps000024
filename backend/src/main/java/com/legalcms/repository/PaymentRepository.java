package com.legalcms.repository;

import com.legalcms.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByIdempotencyKey(String idempotencyKey);
    Optional<Payment> findByPaymentReference(String paymentReference);
    List<Payment> findByBillId(Long billId);

    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p WHERE p.bill.id = :billId AND p.status = 'RECORDED'")
    BigDecimal getTotalPaidAmountForBill(@Param("billId") Long billId);

    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p WHERE p.bill.legalCase.department.id = :departmentId AND p.status = 'RECORDED'")
    BigDecimal getTotalExpenditureByDepartment(@Param("departmentId") Long departmentId);
}
