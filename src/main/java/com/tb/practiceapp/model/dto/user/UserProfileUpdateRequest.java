package com.tb.practiceapp.model.dto.user;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.io.Serial;
import java.io.Serializable;

@Data
public class UserProfileUpdateRequest implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;
    @Size(max = 50, message = "昵称长度不能超过50")
    private String nickname;

    private String avatar;

    @Email(message = "邮箱格式不正确")
    private String email;
}
