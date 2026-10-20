package com.legalcms.repository;

import com.legalcms.entity.BillVersion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BillVersionRepository extends JpaRepository<BillVersion, Long> {
    List<BillVersion> findByBillIdOrderByVersionNoDesc(Long billId);
    long countByBillId(Long billId);
}
