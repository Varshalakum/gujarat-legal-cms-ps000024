package com.legalcms.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "fee_rules")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FeeRule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "category_id", nullable = false)
    private FeeCategory category;

    @Column(name = "rule_type", nullable = false, length = 100)
    private String ruleType; // e.g. PER_HEARING, PER_DOCUMENT, LUMPSUM

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal rate;

    @Column(name = "effective_from", nullable = false)
    private LocalDate effectiveFrom;

    @Column(name = "effective_to")
    private LocalDate effectiveTo;

    @Column(name = "requires_hearing", nullable = false)
    @Builder.Default
    private Boolean requiresHearing = false;

    @Column(name = "required_documents", length = 500)
    private String requiredDocuments;
}
