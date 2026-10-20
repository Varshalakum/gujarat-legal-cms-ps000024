package com.legalcms.controller;

import com.legalcms.dto.ApiResponse;
import com.legalcms.dto.ApprovalInboxDto;
import com.legalcms.service.WorkflowService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/approvals")
@RequiredArgsConstructor
public class ApprovalController {

    private final WorkflowService workflowService;

    @GetMapping("/inbox")
    public ResponseEntity<ApiResponse<List<ApprovalInboxDto>>> getApprovalInbox() {
        List<ApprovalInboxDto> inboxTasks = workflowService.getInboxTasks();
        return ResponseEntity.ok(ApiResponse.ok(inboxTasks));
    }
}
