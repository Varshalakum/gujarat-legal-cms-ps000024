package com.legalcms.service;

import com.legalcms.config.UserPrincipal;
import com.legalcms.dto.ApprovalInboxDto;
import com.legalcms.dto.BillResponseDto;
import com.legalcms.dto.BillVerificationRequest;
import com.legalcms.dto.VerificationCheckItem;
import com.legalcms.dto.WorkflowActionRequest;
import com.legalcms.entity.*;
import com.legalcms.enums.*;
import com.legalcms.exception.BusinessRuleException;
import com.legalcms.exception.ResourceNotFoundException;
import com.legalcms.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class WorkflowService {

    private final BillRepository billRepository;
    private final BillVersionRepository billVersionRepository;
    private final VerificationCheckRepository verificationCheckRepository;
    private final WorkflowDefinitionRepository workflowDefinitionRepository;
    private final WorkflowStageRepository workflowStageRepository;
    private final WorkflowTaskRepository workflowTaskRepository;
    private final ApprovalActionRepository approvalActionRepository;
    private final BillService billService;
    private final AuthService authService;
    private final AuditService auditService;
    private final NotificationService notificationService;

    @Transactional
    public BillResponseDto submitToWorkflow(Long billId) {
        Bill bill = billRepository.findById(billId)
                .orElseThrow(() -> new ResourceNotFoundException("Bill not found with id: " + billId));

        WorkflowDefinition workflow = workflowDefinitionRepository.findByWorkflowCodeAndActiveTrue("STANDARD_BILL_FLOW")
                .orElseThrow(() -> new BusinessRuleException("Active workflow definition 'STANDARD_BILL_FLOW' not found"));

        WorkflowStage firstStage = workflowStageRepository.findByWorkflowIdAndStageOrder(workflow.getId(), 1)
                .orElseThrow(() -> new BusinessRuleException("Initial workflow stage not configured"));

        WorkflowTask task = WorkflowTask.builder()
                .bill(bill)
                .stage(firstStage)
                .status(TaskStatus.PENDING)
                .dueAt(LocalDateTime.now().plusHours(firstStage.getDueHours()))
                .build();

        workflowTaskRepository.save(task);

        bill.setStatus(BillStatus.PENDING_VERIFICATION);
        Bill savedBill = billRepository.save(bill);

        return billService.mapToDto(savedBill);
    }

    @Transactional
    public BillResponseDto performVerification(Long billId, BillVerificationRequest request) {
        Bill bill = billRepository.findById(billId)
                .orElseThrow(() -> new ResourceNotFoundException("Bill not found with id: " + billId));

        User currentUser = authService.getCurrentUser();

        // Self-approval / self-verification check
        if (bill.getAdvocate().getUser().getId().equals(currentUser.getId())) {
            throw new BusinessRuleException("Self-verification blocked: Advocates cannot verify their own fee bills");
        }

        boolean allPassed = true;
        for (VerificationCheckItem item : request.getChecks()) {
            VerificationCheck check = VerificationCheck.builder()
                    .bill(bill)
                    .verifier(currentUser)
                    .checkCode(item.getCheckCode())
                    .result(item.getResult())
                    .comment(item.getComment())
                    .build();

            verificationCheckRepository.save(check);

            if (item.getResult() != CheckResult.PASS && item.getResult() != CheckResult.EXCEPTION_APPROVED) {
                allPassed = false;
            }
        }

        if (allPassed && request.isMarkVerifiedIfAllPass()) {
            bill.setStatus(BillStatus.VERIFIED);

            // Complete current task
            workflowTaskRepository.findFirstByBillIdAndStatus(billId, TaskStatus.PENDING)
                    .ifPresent(task -> {
                        task.setStatus(TaskStatus.COMPLETED);
                        workflowTaskRepository.save(task);
                    });

            // Transition to Approver stage (Stage 2)
            WorkflowStage approverStage = workflowStageRepository.findByWorkflowIdAndStageOrder(1L, 2).orElse(null);
            if (approverStage != null) {
                WorkflowTask approverTask = WorkflowTask.builder()
                        .bill(bill)
                        .stage(approverStage)
                        .status(TaskStatus.PENDING)
                        .dueAt(LocalDateTime.now().plusHours(approverStage.getDueHours()))
                        .build();

                workflowTaskRepository.save(approverTask);
                bill.setStatus(BillStatus.PENDING_APPROVAL);
            }
        } else if (!allPassed) {
            bill.setStatus(BillStatus.RETURNED);
        }

        Bill savedBill = billRepository.save(bill);

        auditService.recordEvent(
                currentUser,
                "VERIFIER",
                "VERIFY_BILL",
                "Bill",
                savedBill.getId(),
                "Bill verification completed. All checks passed: " + allPassed,
                request.getOverallComment()
        );

        return billService.mapToDto(savedBill);
    }

    @Transactional
    public BillResponseDto processWorkflowAction(Long billId, WorkflowActionRequest request) {
        Bill bill = billRepository.findById(billId)
                .orElseThrow(() -> new ResourceNotFoundException("Bill not found with id: " + billId));

        User currentUser = authService.getCurrentUser();

        // 1. RULE: Block Self-Approval
        if (bill.getAdvocate().getUser().getId().equals(currentUser.getId())) {
            throw new BusinessRuleException("Self-approval is strictly blocked: Advocates cannot approve or act upon their own bills");
        }

        // Find active task for this bill
        WorkflowTask task;
        if (request.getTaskId() != null) {
            task = workflowTaskRepository.findById(request.getTaskId())
                    .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + request.getTaskId()));
        } else {
            task = workflowTaskRepository.findFirstByBillIdAndStatus(billId, TaskStatus.PENDING)
                    .orElseThrow(() -> new BusinessRuleException("No pending workflow task found for bill " + bill.getBillNo()));
        }

        // Check authority limit if approving
        if (request.getDecision() == ApprovalDecision.APPROVE) {
            BigDecimal effectiveAmount = request.getApprovedAmount() != null
                    ? request.getApprovedAmount()
                    : bill.getClaimedAmount();

            WorkflowStage stage = task.getStage();
            if (stage.getAuthorityLimit() != null && effectiveAmount.compareTo(stage.getAuthorityLimit()) > 0) {
                // If amount exceeds current stage limit, check if next higher stage exists to escalate
                WorkflowStage nextStage = workflowStageRepository.findByWorkflowIdAndStageOrder(stage.getWorkflow().getId(), stage.getStageOrder() + 1)
                        .orElse(null);

                if (nextStage != null) {
                    // Escalate to next stage
                    task.setStatus(TaskStatus.COMPLETED);
                    workflowTaskRepository.save(task);

                    WorkflowTask escalatedTask = WorkflowTask.builder()
                            .bill(bill)
                            .stage(nextStage)
                            .status(TaskStatus.PENDING)
                            .dueAt(LocalDateTime.now().plusHours(nextStage.getDueHours()))
                            .build();

                    workflowTaskRepository.save(escalatedTask);

                    auditService.recordEvent(
                            currentUser,
                            stage.getRoleCode().name(),
                            "ESCALATE_BILL",
                            "Bill",
                            bill.getId(),
                            "Amount " + effectiveAmount + " exceeds authority limit " + stage.getAuthorityLimit() + ". Escalated to Stage " + nextStage.getStageOrder(),
                            request.getComment()
                    );

                    return billService.mapToDto(bill);
                } else {
                    throw new BusinessRuleException("Amount " + effectiveAmount + " exceeds authority limit " + stage.getAuthorityLimit() + " and no higher stage exists");
                }
            }

            // Final or intermediate approval
            WorkflowStage nextStage = workflowStageRepository.findByWorkflowIdAndStageOrder(stage.getWorkflow().getId(), stage.getStageOrder() + 1)
                    .orElse(null);

            task.setStatus(TaskStatus.COMPLETED);
            workflowTaskRepository.save(task);

            if (nextStage != null && stage.getStageOrder() < 2) { // progress through normal stages
                WorkflowTask nextTask = WorkflowTask.builder()
                        .bill(bill)
                        .stage(nextStage)
                        .status(TaskStatus.PENDING)
                        .dueAt(LocalDateTime.now().plusHours(nextStage.getDueHours()))
                        .build();

                workflowTaskRepository.save(nextTask);
                bill.setStatus(BillStatus.PENDING_APPROVAL);
            } else {
                // Final approval reached
                bill.setStatus(BillStatus.APPROVED);
                bill.setApprovedAmount(effectiveAmount);

                // Create new bill version for approval change
                long versionCount = billVersionRepository.countByBillId(bill.getId());
                BillVersion version = BillVersion.builder()
                        .bill(bill)
                        .versionNo((int) versionCount + 1)
                        .amount(bill.getApprovedAmount())
                        .period(bill.getPeriodStart() + " to " + bill.getPeriodEnd())
                        .changes("Approved by " + currentUser.getName())
                        .reason(request.getComment() != null ? request.getComment() : "Workflow approval")
                        .actor(currentUser)
                        .build();

                billVersionRepository.save(version);
                notificationService.sendNotification(bill.getAdvocate().getUser(), "BILL_APPROVED", "Bill", bill.getId());
            }

        } else if (request.getDecision() == ApprovalDecision.RETURN) {
            task.setStatus(TaskStatus.RETURNED);
            workflowTaskRepository.save(task);
            bill.setStatus(BillStatus.RETURNED);
            notificationService.sendNotification(bill.getAdvocate().getUser(), "BILL_RETURNED", "Bill", bill.getId());

        } else if (request.getDecision() == ApprovalDecision.REJECT) {
            task.setStatus(TaskStatus.REJECTED);
            workflowTaskRepository.save(task);
            bill.setStatus(BillStatus.REJECTED);
            notificationService.sendNotification(bill.getAdvocate().getUser(), "BILL_REJECTED", "Bill", bill.getId());
        }

        // Record Approval Action with Digital Signature details
        boolean signed = Boolean.TRUE.equals(request.getIsDigitallySigned());
        ApprovalAction action = ApprovalAction.builder()
                .task(task)
                .actor(currentUser)
                .decision(request.getDecision())
                .comment(request.getComment())
                .isDigitallySigned(signed)
                .signatureCertificate(signed ? request.getSignatureCertificate() : null)
                .signatureDigest(signed ? request.getSignatureDigest() : null)
                .signedAt(signed ? LocalDateTime.now() : null)
                .build();

        approvalActionRepository.save(action);
        Bill savedBill = billRepository.save(bill);

        auditService.recordEvent(
                currentUser,
                task.getStage().getRoleCode().name(),
                request.getDecision().name() + "_BILL",
                "Bill",
                savedBill.getId(),
                "Decision=" + request.getDecision() + ", NewStatus=" + savedBill.getStatus() + (signed ? " [DSC/e-Sign Verified: " + request.getSignatureCertificate() + "]" : ""),
                request.getComment()
        );

        return billService.mapToDto(savedBill);
    }

    @Transactional(readOnly = true)
    public List<ApprovalInboxDto> getInboxTasks() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof UserPrincipal principal)) {
            return List.of();
        }

        List<RoleCode> userRoles = new ArrayList<>();
        for (GrantedAuthority ga : principal.getAuthorities()) {
            String roleName = ga.getAuthority().replace("ROLE_", "");
            try {
                userRoles.add(RoleCode.valueOf(roleName));
            } catch (IllegalArgumentException ignored) {}
        }

        List<WorkflowTask> tasks = workflowTaskRepository.findInboxTasks(
                principal.getId(),
                userRoles,
                List.of(TaskStatus.PENDING, TaskStatus.IN_PROGRESS)
        );

        return tasks.stream().map(t -> ApprovalInboxDto.builder()
                .taskId(t.getId())
                .billId(t.getBill().getId())
                .billNo(t.getBill().getBillNo())
                .advocateName(t.getBill().getAdvocate().getUser().getName())
                .registrationRef(t.getBill().getAdvocate().getRegistrationRef())
                .caseNumber(t.getBill().getLegalCase().getInternalCaseNo())
                .caseSubject(t.getBill().getLegalCase().getSubject())
                .claimedAmount(t.getBill().getClaimedAmount())
                .approvedAmount(t.getBill().getApprovedAmount())
                .stageOrder(t.getStage().getStageOrder())
                .requiredRole(t.getStage().getRoleCode())
                .stageAuthorityLimit(t.getStage().getAuthorityLimit())
                .enteredAt(t.getEnteredAt())
                .dueAt(t.getDueAt())
                .taskStatus(t.getStatus())
                .build()
        ).collect(Collectors.toList());
    }
}
