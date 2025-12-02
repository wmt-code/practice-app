package com.tb.practiceapp.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Getter
@Setter
@ConfigurationProperties(prefix = "wechat")
public class WechatProperties {
    private String appId = "wxb5f729bc7845d8b7";
    private String appSecret = "9bf0515c0aa57db9719258213785d986";
    private String grantType = "authorization_code";
    private boolean mockEnabled = false;
    private String mockOpenId = "mock-openid";
}
