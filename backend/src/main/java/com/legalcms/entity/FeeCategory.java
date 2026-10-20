package com.legalcms.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "fee_categories")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FeeCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String code;

    @Column(nullable = false, length = 255)
    private String label;

    @Column(nullable = false)
    @Builder.Default
    private Boolean active = true;
}
