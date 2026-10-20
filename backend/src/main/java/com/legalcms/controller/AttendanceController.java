package com.legalcms.controller;

import com.legalcms.dto.ApiResponse;
import com.legalcms.dto.AttendanceResponseDto;
import com.legalcms.dto.AttendanceVerifyRequest;
import com.legalcms.service.AttendanceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/attendance")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceService attendanceService;

    @PatchMapping("/{id}/verify")
    public ResponseEntity<ApiResponse<AttendanceResponseDto>> verifyAttendance(
            @PathVariable Long id,
            @Valid @RequestBody AttendanceVerifyRequest request
    ) {
        AttendanceResponseDto response = attendanceService.verifyAttendance(id, request);
        return ResponseEntity.ok(ApiResponse.ok(response, "Attendance verification recorded"));
    }
}
