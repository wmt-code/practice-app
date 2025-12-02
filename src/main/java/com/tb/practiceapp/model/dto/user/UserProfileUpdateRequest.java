package com.tb.practiceapp.model.dto.user;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UserProfileUpdateRequest {
    @Size(max = 50, message = "昵称长度不能超过50")
    private String nickname;

    private String avatar;

    @Email(message = "邮箱格式不正确")
    private String email;
}
