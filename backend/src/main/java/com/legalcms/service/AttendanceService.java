package com.legalcms.service;

import com.legalcms.dto.AttendanceRecordRequest;
import com.legalcms.dto.AttendanceResponseDto;
import com.legalcms.dto.AttendanceVerifyRequest;
import com.legalcms.entity.Advocate;
import com.legalcms.entity.Hearing;
import com.legalcms.entity.HearingAttendance;
import com.legalcms.entity.User;
import com.legalcms.enums.VerificationStatus;
import com.legalcms.exception.ResourceNotFoundException;
import com.legalcms.repository.AdvocateRepository;
import com.legalcms.repository.HearingAttendanceRepository;
import com.legalcms.repository.HearingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AttendanceService {

    private final HearingAttendanceRepository attendanceRepository;
    private final HearingRepository hearingRepository;
    private final AdvocateRepository advocateRepository;
    private final AuthService authService;
    private final AuditService auditService;

    @Transactional
    public AttendanceResponseDto recordAttendance(Long hearingId, AttendanceRecordRequest request) {
        Hearing hearing = hearingRepository.findById(hearingId)
                .orElseThrow(() -> new ResourceNotFoundException("Hearing not found with id: " + hearingId));

        Advocate advocate = advocateRepository.findById(request.getAdvocateId())
                .orElseThrow(() -> new ResourceNotFoundException("Advocate not found with id: " + request.getAdvocateId()));

        User currentUser = authService.getCurrentUser();

        HearingAttendance attendance = attendanceRepository.findByHearingIdAndAdvocateId(hearingId, request.getAdvocateId())
                .orElse(HearingAttendance.builder()
                        .hearing(hearing)
                        .advocate(advocate)
                        .verificationStatus(VerificationStatus.PENDING)
                        .build());

        attendance.setStatus(request.getStatus());
        attendance.setSourceRef(request.getSourceRef());
        attendance.setNotes(request.getNotes());
        attendance.setEnteredBy(currentUser);

        HearingAttendance savedAttendance = attendanceRepository.save(attendance);

        auditService.recordEvent(
                currentUser,
                "LEGAL_OFFICER",
                "RECORD_ATTENDANCE",
                "HearingAttendance",
                savedAttendance.getId(),
                "Attendance recorded as " + savedAttendance.getStatus() + " for advocate " + advocate.getUser().getName(),
                request.getNotes()
        );

        return mapToDto(savedAttendance);
    }

    @Transactional
    public AttendanceResponseDto verifyAttendance(Long attendanceId, AttendanceVerifyRequest request) {
        HearingAttendance attendance = attendanceRepository.findById(attendanceId)
                .orElseThrow(() -> new ResourceNotFoundException("Attendance record not found with id: " + attendanceId));

        User currentUser = authService.getCurrentUser();

        attendance.setVerificationStatus(request.getVerificationStatus());
        if (request.getNotes() != null) {
            attendance.setNotes((attendance.getNotes() != null ? attendance.getNotes() + " | " : "") + "Verification: " + request.getNotes());
        }

        HearingAttendance savedAttendance = attendanceRepository.save(attendance);

        auditService.recordEvent(
                currentUser,
                "VERIFIER",
                "VERIFY_ATTENDANCE",
                "HearingAttendance",
                savedAttendance.getId(),
                "Attendance verified as " + savedAttendance.getVerificationStatus(),
                request.getNotes()
        );

        return mapToDto(savedAttendance);
    }

    @Transactional(readOnly = true)
    public List<AttendanceResponseDto> getAttendanceForHearing(Long hearingId) {
        return attendanceRepository.findByHearingId(hearingId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public AttendanceResponseDto mapToDto(HearingAttendance a) {
        return AttendanceResponseDto.builder()
                .id(a.getId())
                .hearingId(a.getHearing().getId())
                .advocateId(a.getAdvocate().getId())
                .advocateName(a.getAdvocate().getUser().getName())
                .registrationRef(a.getAdvocate().getRegistrationRef())
                .status(a.getStatus())
                .verificationStatus(a.getVerificationStatus())
                .sourceRef(a.getSourceRef())
                .notes(a.getNotes())
                .enteredByName(a.getEnteredBy() != null ? a.getEnteredBy().getName() : null)
                .enteredAt(a.getEnteredAt())
                .build();
    }
}
