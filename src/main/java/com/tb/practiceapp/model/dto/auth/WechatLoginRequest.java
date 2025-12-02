package com.tb.practiceapp.model.dto.auth;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class WechatLoginRequest {
    @NotBlank(message = "微信授权code不能为空")
    private String code;

    private String nickname;

    private String avatar;
}
