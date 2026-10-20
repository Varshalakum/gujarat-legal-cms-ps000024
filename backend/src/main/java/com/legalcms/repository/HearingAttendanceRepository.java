package com.legalcms.repository;

import com.legalcms.entity.HearingAttendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HearingAttendanceRepository extends JpaRepository<HearingAttendance, Long> {
    List<HearingAttendance> findByHearingId(Long hearingId);
    Optional<HearingAttendance> findByHearingIdAndAdvocateId(Long hearingId, Long advocateId);
}
