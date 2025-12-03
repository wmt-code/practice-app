package com.tb.practiceapp.integration;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class WechatSession {
    private String openId;
    private String unionId;
    private String sessionKey;
    private Integer expiresIn;
}
