package com.legalcms.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "advocates")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Advocate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "registration_ref", nullable = false, unique = true, length = 100)
    private String registrationRef;

    @Column(nullable = false, length = 50)
    private String contact;

    @Column(nullable = false)
    @Builder.Default
    private Boolean active = true;
}
