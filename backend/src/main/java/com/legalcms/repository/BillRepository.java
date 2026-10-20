package com.legalcms.repository;

import com.legalcms.entity.Bill;
import com.legalcms.enums.BillStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface BillRepository extends JpaRepository<Bill, Long> {
    Optional<Bill> findByBillNo(String billNo);
    List<Bill> findByAdvocateId(Long advocateId);
    List<Bill> findByLegalCaseId(Long caseId);
    List<Bill> findByStatus(BillStatus status);

    @Query("SELECT b FROM Bill b WHERE b.advocate.id = :advocateId AND b.legalCase.id = :caseId AND b.claimDate = :claimDate AND b.status NOT IN ('REJECTED', 'WITHDRAWN')")
    List<Bill> findPotentialDuplicates(
        @Param("advocateId") Long advocateId,
        @Param("caseId") Long caseId,
        @Param("claimDate") LocalDate claimDate
    );

    @Query("SELECT b FROM Bill b JOIN b.hearings h WHERE h.id = :hearingId AND b.status NOT IN ('REJECTED', 'WITHDRAWN')")
    List<Bill> findBillsForHearing(@Param("hearingId") Long hearingId);
}
