package com.legalcms.service;

import com.legalcms.entity.Notification;
import com.legalcms.entity.User;
import com.legalcms.enums.DeliveryStatus;
import com.legalcms.enums.NotificationChannel;
import com.legalcms.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    @Transactional
    public Notification sendNotification(User recipient, String eventType, String entityType, Long entityId) {
        Notification notification = Notification.builder()
                .recipient(recipient)
                .eventType(eventType)
                .entityType(entityType)
                .entityId(entityId)
                .channel(NotificationChannel.IN_APP)
                .deliveryStatus(DeliveryStatus.SENT)
                .createdAt(LocalDateTime.now())
                .build();

        return notificationRepository.save(notification);
    }

    @Transactional(readOnly = true)
    public List<Notification> getNotificationsForUser(Long userId) {
        return notificationRepository.findByRecipientIdOrderByCreatedAtDesc(userId);
    }

    @Transactional
    public void markAsRead(Long notificationId) {
        notificationRepository.findById(notificationId).ifPresent(n -> {
            n.setReadAt(LocalDateTime.now());
            n.setDeliveryStatus(DeliveryStatus.DELIVERED);
            notificationRepository.save(n);
        });
    }
}
