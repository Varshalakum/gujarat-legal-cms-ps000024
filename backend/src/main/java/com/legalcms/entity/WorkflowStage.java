package com.legalcms.entity;

import com.legalcms.enums.RoleCode;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "workflow_stages")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkflowStage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workflow_id", nullable = false)
    private WorkflowDefinition workflow;

    @Column(name = "stage_order", nullable = false)
    private Integer stageOrder;

    @Enumerated(EnumType.STRING)
    @Column(name = "role_code", nullable = false, length = 50)
    private RoleCode roleCode;

    @Column(name = "due_hours", nullable = false)
    @Builder.Default
    private Integer dueHours = 48;

    @Column(name = "authority_limit", precision = 14, scale = 2)
    private BigDecimal authorityLimit;
}
