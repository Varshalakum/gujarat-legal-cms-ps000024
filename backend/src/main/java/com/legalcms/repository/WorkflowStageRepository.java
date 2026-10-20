package com.legalcms.repository;

import com.legalcms.entity.WorkflowStage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WorkflowStageRepository extends JpaRepository<WorkflowStage, Long> {
    List<WorkflowStage> findByWorkflowIdOrderByStageOrderAsc(Long workflowId);
    Optional<WorkflowStage> findByWorkflowIdAndStageOrder(Long workflowId, Integer stageOrder);
}
