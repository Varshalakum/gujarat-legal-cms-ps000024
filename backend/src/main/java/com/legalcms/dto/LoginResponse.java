package com.legalcms.dto;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginResponse {
    private String token;
    @Builder.Default
    private String tokenType = "Bearer";
    private Long userId;
    private String name;
    private String login;
    private List<String> roles;
    private Long departmentId;
    private String departmentName;
    private Long advocateId;
}
