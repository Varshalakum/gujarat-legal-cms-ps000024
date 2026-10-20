package com.legalcms.service;

import com.legalcms.dto.AdvocateAssignmentRequest;
import com.legalcms.dto.AdvocateAssignmentResponseDto;
import com.legalcms.dto.CaseCreateRequest;
import com.legalcms.dto.CaseResponseDto;
import com.legalcms.dto.CaseUpdateRequest;
import com.legalcms.entity.*;
import com.legalcms.enums.CaseStatus;
import com.legalcms.exception.BusinessRuleException;
import com.legalcms.exception.ResourceNotFoundException;
import com.legalcms.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CaseService {

    private final LegalCaseRepository legalCaseRepository;
    private final CourtRepository courtRepository;
    private final DepartmentRepository departmentRepository;
    private final AdvocateRepository advocateRepository;
    private final CaseAdvocateAssignmentRepository assignmentRepository;
    private final AuditService auditService;
    private final AuthService authService;

    @Transactional
    public CaseResponseDto createCase(CaseCreateRequest request) {
        if (legalCaseRepository.findByInternalCaseNo(request.getInternalCaseNo()).isPresent()) {
            throw new BusinessRuleException("A case with internal number '" + request.getInternalCaseNo() + "' already exists");
        }

        Court court = courtRepository.findById(request.getCourtId())
                .orElseThrow(() -> new ResourceNotFoundException("Court not found with id: " + request.getCourtId()));

        Department department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + request.getDepartmentId()));

        LegalCase legalCase = LegalCase.builder()
                .internalCaseNo(request.getInternalCaseNo())
                .court(court)
                .courtCaseRef(request.getCourtCaseRef())
                .department(department)
                .caseType(request.getCaseType())
                .subject(request.getSubject())
                .status(CaseStatus.OPEN)
                .priority(request.getPriority() != null ? request.getPriority() : "NORMAL")
                .filingDate(request.getFilingDate())
                .build();

        LegalCase savedCase = legalCaseRepository.save(legalCase);
        User currentUser = authService.getCurrentUser();

        auditService.recordEvent(
                currentUser,
                "LEGAL_OFFICER",
                "CREATE_CASE",
                "LegalCase",
                savedCase.getId(),
                "Created case " + savedCase.getInternalCaseNo(),
                "New case registration"
        );

        return mapToDto(savedCase);
    }

    @Transactional(readOnly = true)
    public List<CaseResponseDto> getAllCases(Long departmentId, CaseStatus status) {
        List<LegalCase> cases;
        if (departmentId != null) {
            cases = legalCaseRepository.findByDepartmentId(departmentId);
        } else if (status != null) {
            cases = legalCaseRepository.findByStatus(status);
        } else {
            cases = legalCaseRepository.findAll();
        }
        return cases.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CaseResponseDto getCaseById(Long id) {
        LegalCase legalCase = legalCaseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Legal case not found with id: " + id));
        return mapToDto(legalCase);
    }

    @Transactional
    public CaseResponseDto updateCase(Long id, CaseUpdateRequest request) {
        LegalCase legalCase = legalCaseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Legal case not found with id: " + id));

        String beforeSummary = "Status=" + legalCase.getStatus() + ", Priority=" + legalCase.getPriority();

        if (request.getCourtCaseRef() != null) {
            legalCase.setCourtCaseRef(request.getCourtCaseRef());
        }
        if (request.getCaseType() != null) {
            legalCase.setCaseType(request.getCaseType());
        }
        if (request.getSubject() != null) {
            legalCase.setSubject(request.getSubject());
        }
        if (request.getStatus() != null) {
            legalCase.setStatus(request.getStatus());
        }
        if (request.getPriority() != null) {
            legalCase.setPriority(request.getPriority());
        }

        LegalCase updatedCase = legalCaseRepository.save(legalCase);
        User currentUser = authService.getCurrentUser();

        auditService.recordEvent(
                currentUser,
                "LEGAL_OFFICER",
                "UPDATE_CASE",
                "LegalCase",
                updatedCase.getId(),
                beforeSummary + " -> Status=" + updatedCase.getStatus() + ", Priority=" + updatedCase.getPriority(),
                "Case update"
        );

        return mapToDto(updatedCase);
    }

    @Transactional
    public AdvocateAssignmentResponseDto assignAdvocate(Long caseId, AdvocateAssignmentRequest request) {
        LegalCase legalCase = legalCaseRepository.findById(caseId)
                .orElseThrow(() -> new ResourceNotFoundException("Legal case not found with id: " + caseId));

        Advocate advocate = advocateRepository.findById(request.getAdvocateId())
                .orElseThrow(() -> new ResourceNotFoundException("Advocate not found with id: " + request.getAdvocateId()));

        User currentUser = authService.getCurrentUser();

        CaseAdvocateAssignment assignment = CaseAdvocateAssignment.builder()
                .legalCase(legalCase)
                .advocate(advocate)
                .role(request.getRole())
                .validFrom(request.getValidFrom())
                .validTo(request.getValidTo())
                .reason(request.getReason())
                .changedBy(currentUser)
                .build();

        CaseAdvocateAssignment savedAssignment = assignmentRepository.save(assignment);

        auditService.recordEvent(
                currentUser,
                "LEGAL_OFFICER",
                "ASSIGN_ADVOCATE",
                "CaseAdvocateAssignment",
                savedAssignment.getId(),
                "Assigned advocate " + advocate.getUser().getName() + " as " + request.getRole() + " to case " + legalCase.getInternalCaseNo(),
                request.getReason()
        );

        return mapAssignmentToDto(savedAssignment);
    }

    @Transactional(readOnly = true)
    public List<AdvocateAssignmentResponseDto> getAdvocateAssignments(Long caseId) {
        return assignmentRepository.findByLegalCaseId(caseId).stream()
                .map(this::mapAssignmentToDto)
                .collect(Collectors.toList());
    }

    public CaseResponseDto mapToDto(LegalCase legalCase) {
        return CaseResponseDto.builder()
                .id(legalCase.getId())
                .internalCaseNo(legalCase.getInternalCaseNo())
                .courtId(legalCase.getCourt().getId())
                .courtName(legalCase.getCourt().getName())
                .courtLevel(legalCase.getCourt().getLevel())
                .courtCaseRef(legalCase.getCourtCaseRef())
                .departmentId(legalCase.getDepartment().getId())
                .departmentName(legalCase.getDepartment().getName())
                .caseType(legalCase.getCaseType())
                .subject(legalCase.getSubject())
                .status(legalCase.getStatus())
                .priority(legalCase.getPriority())
                .filingDate(legalCase.getFilingDate())
                .createdAt(legalCase.getCreatedAt())
                .updatedAt(legalCase.getUpdatedAt())
                .build();
    }

    public AdvocateAssignmentResponseDto mapAssignmentToDto(CaseAdvocateAssignment a) {
        return AdvocateAssignmentResponseDto.builder()
                .id(a.getId())
                .caseId(a.getLegalCase().getId())
                .advocateId(a.getAdvocate().getId())
                .advocateName(a.getAdvocate().getUser().getName())
                .registrationRef(a.getAdvocate().getRegistrationRef())
                .role(a.getRole())
                .validFrom(a.getValidFrom())
                .validTo(a.getValidTo())
                .reason(a.getReason())
                .changedByName(a.getChangedBy() != null ? a.getChangedBy().getName() : null)
                .createdAt(a.getCreatedAt())
                .build();
    }
}
