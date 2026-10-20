package com.legalcms.controller;

import com.legalcms.config.UserPrincipal;
import com.legalcms.dto.ApiResponse;
import com.legalcms.dto.NotificationDto;
import com.legalcms.entity.Notification;
import com.legalcms.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<NotificationDto>>> getNotifications(
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        List<Notification> notifications = notificationService.getNotificationsForUser(principal.getId());
        List<NotificationDto> dtos = notifications.stream().map(n -> NotificationDto.builder()
                .id(n.getId())
                .recipientId(n.getRecipient().getId())
                .eventType(n.getEventType())
                .entityType(n.getEntityType())
                .entityId(n.getEntityId())
                .createdAt(n.getCreatedAt())
                .readAt(n.getReadAt())
                .channel(n.getChannel())
                .deliveryStatus(n.getDeliveryStatus())
                .build()
        ).collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.ok(dtos));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok(ApiResponse.ok(null, "Notification marked as read"));
    }
}
