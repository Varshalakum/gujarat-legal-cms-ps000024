package com.legalcms.repository;

import com.legalcms.entity.FeeRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FeeRuleRepository extends JpaRepository<FeeRule, Long> {
    List<FeeRule> findByCategoryId(Long categoryId);
}
