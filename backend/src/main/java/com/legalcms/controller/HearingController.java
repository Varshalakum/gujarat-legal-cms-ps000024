package com.legalcms.controller;

import com.legalcms.dto.ApiResponse;
import com.legalcms.dto.AttendanceRecordRequest;
import com.legalcms.dto.AttendanceResponseDto;
import com.legalcms.dto.HearingResponseDto;
import com.legalcms.dto.HearingUpdateRequest;
import com.legalcms.service.AttendanceService;
import com.legalcms.service.HearingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/hearings")
@RequiredArgsConstructor
public class HearingController {

    private final HearingService hearingService;
    private final AttendanceService attendanceService;

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<HearingResponseDto>> getHearingById(@PathVariable Long id) {
        HearingResponseDto response = hearingService.getHearingById(id);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse<HearingResponseDto>> updateHearing(
            @PathVariable Long id,
            @RequestBody HearingUpdateRequest request
    ) {
        HearingResponseDto response = hearingService.updateHearing(id, request);
        return ResponseEntity.ok(ApiResponse.ok(response, "Hearing updated successfully"));
    }

    @PostMapping("/{id}/attendance")
    public ResponseEntity<ApiResponse<AttendanceResponseDto>> recordAttendance(
            @PathVariable Long id,
            @Valid @RequestBody AttendanceRecordRequest request
    ) {
        AttendanceResponseDto response = attendanceService.recordAttendance(id, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(response, "Attendance recorded successfully"));
    }

    @GetMapping("/{id}/attendance")
    public ResponseEntity<ApiResponse<List<AttendanceResponseDto>>> getAttendanceForHearing(@PathVariable Long id) {
        List<AttendanceResponseDto> list = attendanceService.getAttendanceForHearing(id);
        return ResponseEntity.ok(ApiResponse.ok(list));
    }
}
