package com.legalcms.repository;

import com.legalcms.entity.HearingChangeEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HearingChangeEventRepository extends JpaRepository<HearingChangeEvent, Long> {
    List<HearingChangeEvent> findByHearingIdOrderByCreatedAtDesc(Long hearingId);
}
