package com.legalcms.repository;

import com.legalcms.entity.BillDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BillDocumentRepository extends JpaRepository<BillDocument, Long> {
    List<BillDocument> findByBillId(Long billId);
    java.util.Optional<BillDocument> findFirstByChecksumSha256(String checksumSha256);
}
