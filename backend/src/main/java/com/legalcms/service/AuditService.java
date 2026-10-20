package com.legalcms.service;

import com.legalcms.entity.AuditEvent;
import com.legalcms.entity.User;
import com.legalcms.repository.AuditEventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuditService {

    private static final String GENESIS_HASH = "GENESIS_ROOT_HASH_GUJARAT_LEGAL_CMS_2026";
    private final AuditEventRepository auditEventRepository;

    /**
     * Cryptographically chained, append-only audit logger.
     * Uses REQUIRES_NEW propagation to ensure audit log is persisted even if outer transaction rolls back.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void recordEvent(
            User actor,
            String roleCode,
            String action,
            String entityType,
            Long entityId,
            String beforeAfterSummary,
            String reason
    ) {
        try {
            String prevHash = auditEventRepository.findTopByOrderByIdDesc()
                    .map(e -> e.getCurrentHash() != null ? e.getCurrentHash() : GENESIS_HASH)
                    .orElse(GENESIS_HASH);

            String payload = prevHash + ":" +
                    (actor != null ? actor.getId() : 0) + ":" +
                    (roleCode != null ? roleCode : "SYSTEM") + ":" +
                    action + ":" +
                    entityType + ":" +
                    (entityId != null ? entityId : 0) + ":" +
                    (beforeAfterSummary != null ? beforeAfterSummary : "");

            String currHash = computeSha256(payload);

            AuditEvent event = AuditEvent.builder()
                    .actor(actor)
                    .roleCode(roleCode)
                    .action(action)
                    .entityType(entityType)
                    .entityId(entityId)
                    .beforeAfterSummary(beforeAfterSummary)
                    .reason(reason)
                    .requestId(UUID.randomUUID().toString())
                    .previousHash(prevHash)
                    .currentHash(currHash)
                    .createdAt(LocalDateTime.now())
                    .build();

            auditEventRepository.save(event);
            log.info("Audit event recorded: [{}] by user {} on {}:{} (Hash: {})", action, actor != null ? actor.getLogin() : "SYSTEM", entityType, entityId, currHash.substring(0, 12));
        } catch (Exception ex) {
            log.error("Failed to record audit event: {}", ex.getMessage(), ex);
        }
    }

    @Transactional(readOnly = true)
    public List<AuditEvent> getAllEvents() {
        return auditEventRepository.findAllByOrderByCreatedAtDesc();
    }

    @Transactional(readOnly = true)
    public List<AuditEvent> getEventsForEntity(String entityType, Long entityId) {
        return auditEventRepository.findByEntityTypeAndEntityIdOrderByCreatedAtDesc(entityType, entityId);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> verifyAuditChain() {
        List<AuditEvent> events = auditEventRepository.findAllByOrderByIdAsc();
        String expectedPrevHash = GENESIS_HASH;
        boolean intact = true;
        Long tamperedId = null;

        for (AuditEvent ev : events) {
            if (ev.getPreviousHash() != null && !expectedPrevHash.equals(ev.getPreviousHash())) {
                intact = false;
                tamperedId = ev.getId();
                break;
            }

            String payload = (ev.getPreviousHash() != null ? ev.getPreviousHash() : GENESIS_HASH) + ":" +
                    (ev.getActor() != null ? ev.getActor().getId() : 0) + ":" +
                    (ev.getRoleCode() != null ? ev.getRoleCode() : "SYSTEM") + ":" +
                    ev.getAction() + ":" +
                    ev.getEntityType() + ":" +
                    (ev.getEntityId() != null ? ev.getEntityId() : 0) + ":" +
                    (ev.getBeforeAfterSummary() != null ? ev.getBeforeAfterSummary() : "");

            String computed = computeSha256(payload);
            if (ev.getCurrentHash() != null && !computed.equals(ev.getCurrentHash())) {
                intact = false;
                tamperedId = ev.getId();
                break;
            }

            if (ev.getCurrentHash() != null) {
                expectedPrevHash = ev.getCurrentHash();
            }
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("chainIntact", intact);
        result.put("totalVerifiedEvents", events.size());
        result.put("tamperedEventId", tamperedId);
        result.put("latestHash", expectedPrevHash);
        result.put("verificationStatus", intact ? "CRYPTOGRAPHIC_INTEGRITY_VERIFIED" : "TAMPERING_DETECTED");
        return result;
    }

    private String computeSha256(String data) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not available", e);
        }
    }
}
