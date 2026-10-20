package com.legalcms.repository;

import com.legalcms.entity.AccountingEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AccountingEntryRepository extends JpaRepository<AccountingEntry, Long> {
    Optional<AccountingEntry> findByVoucherReference(String voucherReference);
    List<AccountingEntry> findByPaymentId(Long paymentId);
    List<AccountingEntry> findByFinancialYear(String financialYear);
}
