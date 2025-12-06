package com.tb.practiceapp.model.enums;

import lombok.Getter;

@Getter
public enum UserRoleEnum {
    USER("USER", "普通用户"),
    ADMIN("ADMIN", "管理员");
    private final String role;
    private final String description;

    UserRoleEnum(String role, String description) {
        this.role = role;
        this.description = description;
    }
}
