package com.tb.practiceapp.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Getter
@Setter
@ConfigurationProperties(prefix = "wechat")
public class WechatProperties {
    private String appId;
    private String appSecret;
    private String grantType = "authorization_code";
    private boolean mockEnabled = false;
    private String mockOpenId = "mock-openid";
    private String mockSessionKey = "mock-session-key";
}
