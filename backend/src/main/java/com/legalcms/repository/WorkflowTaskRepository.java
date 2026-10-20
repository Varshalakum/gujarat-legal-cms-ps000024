package com.legalcms.repository;

import com.legalcms.entity.WorkflowTask;
import com.legalcms.enums.RoleCode;
import com.legalcms.enums.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface WorkflowTaskRepository extends JpaRepository<WorkflowTask, Long> {
    List<WorkflowTask> findByBillIdOrderByEnteredAtAsc(Long billId);
    Optional<WorkflowTask> findFirstByBillIdAndStatus(Long billId, TaskStatus status);

    @Query("SELECT wt FROM WorkflowTask wt WHERE (wt.owner.id = :userId OR (wt.owner IS NULL AND wt.stage.roleCode IN :roles)) AND wt.status IN :statuses ORDER BY wt.enteredAt DESC")
    List<WorkflowTask> findInboxTasks(
        @Param("userId") Long userId,
        @Param("roles") Collection<RoleCode> roles,
        @Param("statuses") Collection<TaskStatus> statuses
    );
}
