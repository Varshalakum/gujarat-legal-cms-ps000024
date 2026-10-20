package com.legalcms.dto;

import com.legalcms.enums.DeliveryStatus;
import com.legalcms.enums.NotificationChannel;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationDto {
    private Long id;
    private Long recipientId;
    private String eventType;
    private String entityType;
    private Long entityId;
    private LocalDateTime createdAt;
    private LocalDateTime readAt;
    private NotificationChannel channel;
    private DeliveryStatus deliveryStatus;
}
