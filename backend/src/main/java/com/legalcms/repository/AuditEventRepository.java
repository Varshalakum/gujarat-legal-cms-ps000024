package com.legalcms.repository;

import com.legalcms.entity.AuditEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditEventRepository extends JpaRepository<AuditEvent, Long> {
    List<AuditEvent> findAllByOrderByCreatedAtDesc();
    List<AuditEvent> findAllByOrderByIdAsc();
    java.util.Optional<AuditEvent> findTopByOrderByIdDesc();
    List<AuditEvent> findByEntityTypeAndEntityIdOrderByCreatedAtDesc(String entityType, Long entityId);
    List<AuditEvent> findByActorIdOrderByCreatedAtDesc(Long actorId);
}
