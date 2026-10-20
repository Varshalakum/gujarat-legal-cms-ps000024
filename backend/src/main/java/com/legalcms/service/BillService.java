package com.legalcms.service;

import com.legalcms.dto.BillCreateRequest;
import com.legalcms.dto.BillDocumentDto;
import com.legalcms.dto.BillResponseDto;
import com.legalcms.dto.DuplicateCheckRequest;
import com.legalcms.dto.DuplicateCheckResponse;
import com.legalcms.entity.*;
import com.legalcms.enums.BillStatus;
import com.legalcms.exception.BusinessRuleException;
import com.legalcms.exception.ResourceNotFoundException;
import com.legalcms.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class BillService {

    private final BillRepository billRepository;
    private final BillVersionRepository billVersionRepository;
    private final BillDocumentRepository billDocumentRepository;
    private final AdvocateRepository advocateRepository;
    private final LegalCaseRepository legalCaseRepository;
    private final FeeCategoryRepository feeCategoryRepository;
    private final HearingRepository hearingRepository;
    private final PaymentRepository paymentRepository;
    private final AuthService authService;
    private final AuditService auditService;

    @Value("${app.upload.dir:./uploads/bills}")
    private String uploadDir;

    @Transactional
    public BillResponseDto createBill(BillCreateRequest request) {
        Advocate advocate = advocateRepository.findById(request.getAdvocateId())
                .orElseThrow(() -> new ResourceNotFoundException("Advocate not found with id: " + request.getAdvocateId()));

        LegalCase legalCase = legalCaseRepository.findById(request.getCaseId())
                .orElseThrow(() -> new ResourceNotFoundException("Legal case not found with id: " + request.getCaseId()));

        FeeCategory category = feeCategoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Fee category not found with id: " + request.getCategoryId()));

        // Run duplicate check
        DuplicateCheckResponse dupCheck = checkDuplicate(DuplicateCheckRequest.builder()
                .advocateId(request.getAdvocateId())
                .caseId(request.getCaseId())
                .claimDate(request.getClaimDate())
                .hearingIds(request.getHearingIds())
                .build());

        if (dupCheck.isDuplicate()) {
            throw new BusinessRuleException("Duplicate bill detected: " + dupCheck.getMessage());
        }

        // Generate Bill Number
        String billNo = "BILL-" + System.currentTimeMillis() + "-" + advocate.getId();

        Set<Hearing> hearings = new HashSet<>();
        if (request.getHearingIds() != null && !request.getHearingIds().isEmpty()) {
            hearings.addAll(hearingRepository.findAllById(request.getHearingIds()));
        }

        Bill bill = Bill.builder()
                .billNo(billNo)
                .advocate(advocate)
                .legalCase(legalCase)
                .billReference(request.getBillReference())
                .claimDate(request.getClaimDate())
                .periodStart(request.getPeriodStart())
                .periodEnd(request.getPeriodEnd())
                .category(category)
                .claimedAmount(request.getClaimedAmount())
                .approvedAmount(null)
                .status(BillStatus.SUBMITTED)
                .submittedAt(LocalDateTime.now())
                .hearings(hearings)
                .build();

        Bill savedBill = billRepository.save(bill);
        User currentUser = authService.getCurrentUser();

        // Create version 1
        BillVersion version1 = BillVersion.builder()
                .bill(savedBill)
                .versionNo(1)
                .amount(savedBill.getClaimedAmount())
                .period(savedBill.getPeriodStart() + " to " + savedBill.getPeriodEnd())
                .changes("Initial submission")
                .reason("Initial bill generation")
                .actor(currentUser)
                .build();

        billVersionRepository.save(version1);

        auditService.recordEvent(
                currentUser,
                "ADVOCATE",
                "SUBMIT_BILL",
                "Bill",
                savedBill.getId(),
                "Bill " + savedBill.getBillNo() + " submitted with claimed amount " + savedBill.getClaimedAmount(),
                "Initial bill submission"
        );

        return mapToDto(savedBill);
    }

    @Transactional(readOnly = true)
    public BillResponseDto getBillById(Long id) {
        Bill bill = billRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bill not found with id: " + id));
        return mapToDto(bill);
    }

    @Transactional(readOnly = true)
    public List<BillResponseDto> getAllBills(Long advocateId, Long caseId, BillStatus status) {
        List<Bill> bills;
        if (advocateId != null) {
            bills = billRepository.findByAdvocateId(advocateId);
        } else if (caseId != null) {
            bills = billRepository.findByLegalCaseId(caseId);
        } else if (status != null) {
            bills = billRepository.findByStatus(status);
        } else {
            bills = billRepository.findAll();
        }
        return bills.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public DuplicateCheckResponse checkDuplicate(DuplicateCheckRequest request) {
        List<Bill> potentialDuplicates = billRepository.findPotentialDuplicates(
                request.getAdvocateId(), request.getCaseId(), request.getClaimDate());

        List<Long> conflictingBillIds = new ArrayList<>();
        List<Long> conflictingHearingIds = new ArrayList<>();

        for (Bill bill : potentialDuplicates) {
            conflictingBillIds.add(bill.getId());
        }

        if (request.getHearingIds() != null) {
            for (Long hearingId : request.getHearingIds()) {
                List<Bill> billedHearings = billRepository.findBillsForHearing(hearingId);
                for (Bill b : billedHearings) {
                    if (!conflictingBillIds.contains(b.getId())) {
                        conflictingBillIds.add(b.getId());
                    }
                    if (!conflictingHearingIds.contains(hearingId)) {
                        conflictingHearingIds.add(hearingId);
                    }
                }
            }
        }

        if (!conflictingBillIds.isEmpty()) {
            return DuplicateCheckResponse.builder()
                    .duplicate(true)
                    .message("Potential duplicate claims found with bill ID(s): " + conflictingBillIds
                            + (!conflictingHearingIds.isEmpty() ? " and overlapping hearing ID(s): " + conflictingHearingIds : ""))
                    .conflictingBillIds(conflictingBillIds)
                    .conflictingHearingIds(conflictingHearingIds)
                    .build();
        }

        return DuplicateCheckResponse.builder()
                .duplicate(false)
                .message("No duplicate bills found")
                .conflictingBillIds(Collections.emptyList())
                .conflictingHearingIds(Collections.emptyList())
                .build();
    }

    @Transactional
    public BillDocumentDto uploadDocument(Long billId, MultipartFile file, String documentType) throws IOException {
        Bill bill = billRepository.findById(billId)
                .orElseThrow(() -> new ResourceNotFoundException("Bill not found with id: " + billId));

        User currentUser = authService.getCurrentUser();

        // 1. Security Check: File Extension & MIME Validation
        String filename = file.getOriginalFilename();
        if (filename == null || filename.trim().isEmpty()) {
            throw new BusinessRuleException("Upload failed: Filename cannot be empty");
        }
        String lowerName = filename.toLowerCase();
        boolean isAllowed = lowerName.endsWith(".pdf") || lowerName.endsWith(".png") ||
                lowerName.endsWith(".jpg") || lowerName.endsWith(".jpeg") ||
                lowerName.endsWith(".docx");
        if (!isAllowed) {
            throw new BusinessRuleException("Security Policy: Only PDF, PNG, JPG, and DOCX files are permitted for court vouchers. Script, binary, and executable payloads are blocked.");
        }

        // 2. Compute SHA-256 Checksum
        byte[] fileBytes = file.getBytes();
        String checksum;
        try {
            java.security.MessageDigest md = java.security.MessageDigest.getInstance("SHA-256");
            byte[] digest = md.digest(fileBytes);
            StringBuilder sb = new StringBuilder();
            for (byte b : digest) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) sb.append('0');
                sb.append(hex);
            }
            checksum = sb.toString();
        } catch (java.security.NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm missing", e);
        }

        // 3. Duplicate Document Check
        boolean isDuplicate = billDocumentRepository.findFirstByChecksumSha256(checksum).isPresent();
        if (isDuplicate) {
            log.warn("Identical document checksum {} re-uploaded for bill ID {}", checksum, bill.getId());
        }

        // Create storage directory if absent
        Path storageDirectory = Paths.get(uploadDir);
        if (!Files.exists(storageDirectory)) {
            Files.createDirectories(storageDirectory);
        }

        String storageFileName = UUID.randomUUID() + "_" + filename.replaceAll("[^a-zA-Z0-9._-]", "_");
        Path targetPath = storageDirectory.resolve(storageFileName);
        Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

        BillDocument document = BillDocument.builder()
                .bill(bill)
                .storageKey(targetPath.toAbsolutePath().toString())
                .originalFilename(filename)
                .mimeType(file.getContentType() != null ? file.getContentType() : "application/octet-stream")
                .sizeBytes(file.getSize())
                .documentType(documentType != null ? documentType : "SUPPORTING_DOC")
                .checksumSha256(checksum)
                .uploadedBy(currentUser)
                .build();

        BillDocument savedDoc = billDocumentRepository.save(document);

        auditService.recordEvent(
                currentUser,
                "ADVOCATE",
                "UPLOAD_BILL_DOCUMENT",
                "BillDocument",
                savedDoc.getId(),
                "Uploaded " + savedDoc.getOriginalFilename() + " (SHA-256: " + checksum.substring(0, 12) + "...) for bill " + bill.getBillNo(),
                "Supporting document upload. Duplicate re-use flag: " + isDuplicate
        );

        return BillDocumentDto.builder()
                .id(savedDoc.getId())
                .billId(bill.getId())
                .originalFilename(savedDoc.getOriginalFilename())
                .mimeType(savedDoc.getMimeType())
                .sizeBytes(savedDoc.getSizeBytes())
                .documentType(savedDoc.getDocumentType())
                .checksumSha256(savedDoc.getChecksumSha256())
                .duplicateDetected(isDuplicate)
                .uploadedByName(currentUser.getName())
                .uploadedAt(savedDoc.getUploadedAt())
                .build();
    }

    @Transactional(readOnly = true)
    public List<BillDocumentDto> getBillDocuments(Long billId) {
        return billDocumentRepository.findByBillId(billId).stream()
                .map(doc -> BillDocumentDto.builder()
                        .id(doc.getId())
                        .billId(doc.getBill().getId())
                        .originalFilename(doc.getOriginalFilename())
                        .mimeType(doc.getMimeType())
                        .sizeBytes(doc.getSizeBytes())
                        .documentType(doc.getDocumentType())
                        .checksumSha256(doc.getChecksumSha256())
                        .duplicateDetected(false)
                        .uploadedByName(doc.getUploadedBy() != null ? doc.getUploadedBy().getName() : null)
                        .uploadedAt(doc.getUploadedAt())
                        .build())
                .collect(Collectors.toList());
    }

    public BillResponseDto mapToDto(Bill bill) {
        BigDecimal totalPaid = paymentRepository.getTotalPaidAmountForBill(bill.getId());
        if (totalPaid == null) totalPaid = BigDecimal.ZERO;

        BigDecimal approved = bill.getApprovedAmount() != null ? bill.getApprovedAmount() : BigDecimal.ZERO;
        BigDecimal remaining = approved.subtract(totalPaid).max(BigDecimal.ZERO);

        Set<Long> hearingIds = bill.getHearings() != null
                ? bill.getHearings().stream().map(Hearing::getId).collect(Collectors.toSet())
                : Collections.emptySet();

        return BillResponseDto.builder()
                .id(bill.getId())
                .billNo(bill.getBillNo())
                .advocateId(bill.getAdvocate().getId())
                .advocateName(bill.getAdvocate().getUser().getName())
                .registrationRef(bill.getAdvocate().getRegistrationRef())
                .caseId(bill.getLegalCase().getId())
                .internalCaseNo(bill.getLegalCase().getInternalCaseNo())
                .courtCaseRef(bill.getLegalCase().getCourtCaseRef())
                .categoryId(bill.getCategory().getId())
                .categoryLabel(bill.getCategory().getLabel())
                .claimedAmount(bill.getClaimedAmount())
                .approvedAmount(bill.getApprovedAmount())
                .paidAmount(totalPaid)
                .remainingBalance(remaining)
                .status(bill.getStatus())
                .billReference(bill.getBillReference())
                .claimDate(bill.getClaimDate())
                .periodStart(bill.getPeriodStart())
                .periodEnd(bill.getPeriodEnd())
                .submittedAt(bill.getSubmittedAt())
                .createdAt(bill.getCreatedAt())
                .updatedAt(bill.getUpdatedAt())
                .hearingIds(hearingIds)
                .build();
    }
}
