package com.legalcms.service;

import com.legalcms.dto.HearingCreateRequest;
import com.legalcms.dto.HearingResponseDto;
import com.legalcms.dto.HearingUpdateRequest;
import com.legalcms.entity.Court;
import com.legalcms.entity.Hearing;
import com.legalcms.entity.HearingChangeEvent;
import com.legalcms.entity.LegalCase;
import com.legalcms.entity.User;
import com.legalcms.enums.HearingOutcome;
import com.legalcms.exception.ResourceNotFoundException;
import com.legalcms.repository.CourtRepository;
import com.legalcms.repository.HearingChangeEventRepository;
import com.legalcms.repository.HearingRepository;
import com.legalcms.repository.LegalCaseRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class HearingService {

    private final HearingRepository hearingRepository;
    private final LegalCaseRepository legalCaseRepository;
    private final CourtRepository courtRepository;
    private final HearingChangeEventRepository hearingChangeEventRepository;
    private final AuthService authService;
    private final AuditService auditService;

    @Transactional
    public HearingResponseDto createHearing(Long caseId, HearingCreateRequest request) {
        LegalCase legalCase = legalCaseRepository.findById(caseId)
                .orElseThrow(() -> new ResourceNotFoundException("Legal case not found with id: " + caseId));

        Court court = courtRepository.findById(request.getCourtId())
                .orElseThrow(() -> new ResourceNotFoundException("Court not found with id: " + request.getCourtId()));

        User currentUser = authService.getCurrentUser();

        Hearing hearing = Hearing.builder()
                .legalCase(legalCase)
                .court(court)
                .scheduledAt(request.getScheduledAt())
                .outcome(request.getOutcome() != null ? request.getOutcome() : HearingOutcome.SCHEDULED)
                .nextHearingAt(request.getNextHearingAt())
                .postponementReason(request.getPostponementReason())
                .notes(request.getNotes())
                .enteredBy(currentUser)
                .build();

        Hearing savedHearing = hearingRepository.save(hearing);

        auditService.recordEvent(
                currentUser,
                "LEGAL_OFFICER",
                "CREATE_HEARING",
                "Hearing",
                savedHearing.getId(),
                "Hearing scheduled at " + savedHearing.getScheduledAt() + " for case " + legalCase.getInternalCaseNo(),
                "New hearing scheduled"
        );

        return mapToDto(savedHearing);
    }

    @Transactional(readOnly = true)
    public List<HearingResponseDto> getHearingsForCase(Long caseId) {
        return hearingRepository.findByLegalCaseIdOrderByScheduledAtDesc(caseId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public HearingResponseDto getHearingById(Long id) {
        Hearing hearing = hearingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hearing not found with id: " + id));
        return mapToDto(hearing);
    }

    @Transactional
    public HearingResponseDto updateHearing(Long id, HearingUpdateRequest request) {
        Hearing hearing = hearingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hearing not found with id: " + id));

        User currentUser = authService.getCurrentUser();

        // Check if scheduledAt changed, log hearing_change_event
        if (request.getScheduledAt() != null && !request.getScheduledAt().isEqual(hearing.getScheduledAt())) {
            LocalDateTime oldDate = hearing.getScheduledAt();
            hearing.setScheduledAt(request.getScheduledAt());

            HearingChangeEvent changeEvent = HearingChangeEvent.builder()
                    .hearing(hearing)
                    .previousDate(oldDate)
                    .newDate(request.getScheduledAt())
                    .reason(request.getRescheduleReason() != null ? request.getRescheduleReason() : "Rescheduled")
                    .actor(currentUser)
                    .build();

            hearingChangeEventRepository.save(changeEvent);

            auditService.recordEvent(
                    currentUser,
                    "LEGAL_OFFICER",
                    "RESCHEDULE_HEARING",
                    "Hearing",
                    hearing.getId(),
                    "Hearing rescheduled from " + oldDate + " to " + request.getScheduledAt(),
                    request.getRescheduleReason()
            );
        }

        if (request.getOutcome() != null) {
            hearing.setOutcome(request.getOutcome());
        }
        if (request.getNextHearingAt() != null) {
            hearing.setNextHearingAt(request.getNextHearingAt());
        }
        if (request.getPostponementReason() != null) {
            hearing.setPostponementReason(request.getPostponementReason());
        }
        if (request.getNotes() != null) {
            hearing.setNotes(request.getNotes());
        }

        Hearing updatedHearing = hearingRepository.save(hearing);

        auditService.recordEvent(
                currentUser,
                "LEGAL_OFFICER",
                "UPDATE_HEARING",
                "Hearing",
                updatedHearing.getId(),
                "Hearing outcome: " + updatedHearing.getOutcome(),
                "Hearing update"
        );

        return mapToDto(updatedHearing);
    }

    public HearingResponseDto mapToDto(Hearing hearing) {
        return HearingResponseDto.builder()
                .id(hearing.getId())
                .caseId(hearing.getLegalCase().getId())
                .internalCaseNo(hearing.getLegalCase().getInternalCaseNo())
                .courtId(hearing.getCourt().getId())
                .courtName(hearing.getCourt().getName())
                .scheduledAt(hearing.getScheduledAt())
                .outcome(hearing.getOutcome())
                .nextHearingAt(hearing.getNextHearingAt())
                .postponementReason(hearing.getPostponementReason())
                .notes(hearing.getNotes())
                .enteredByName(hearing.getEnteredBy() != null ? hearing.getEnteredBy().getName() : null)
                .createdAt(hearing.getCreatedAt())
                .build();
    }
}
