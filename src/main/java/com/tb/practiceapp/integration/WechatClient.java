package com.tb.practiceapp.integration;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.tb.practiceapp.common.BusinessException;
import com.tb.practiceapp.common.ErrorCode;
import com.tb.practiceapp.config.WechatProperties;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.StringUtils;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
@RequiredArgsConstructor
public class WechatClient {

    private final RestTemplate restTemplate;
    private final WechatProperties properties;

    public WechatSession exchangeCode(String code) {
        if (properties.isMockEnabled() || StringUtils.isAnyBlank(properties.getAppId(), properties.getAppSecret())) {
            return new WechatSession(properties.getMockOpenId(), null, "mock-access-token", "mock-refresh-token", 7200);
        }
        String url = String.format(
                "https://api.weixin.qq.com/sns/oauth2/access_token?appid=%s&secret=%s&code=%s&grant_type=%s",
                properties.getAppId(), properties.getAppSecret(), code, properties.getGrantType());
        try {
            ResponseEntity<WechatResponse> response = restTemplate.getForEntity(url, WechatResponse.class);
            WechatResponse body = response.getBody();
            if (body == null) {
                throw new BusinessException(ErrorCode.BAD_REQUEST, "微信认证返回为空");
            }
            if (body.getErrorCode() != null && body.getErrorCode() != 0) {
                throw new BusinessException(ErrorCode.BAD_REQUEST, "微信认证失败：" + body.getErrorMessage());
            }
            if (StringUtils.isBlank(body.getOpenid())) {
                throw new BusinessException(ErrorCode.BAD_REQUEST, "微信未返回openid");
            }
            return new WechatSession(body.getOpenid(), body.getUnionid(), body.getAccessToken(), body.getRefreshToken(), body.getExpiresIn());
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "微信接口调用失败");
        }
    }

    @Data
    private static class WechatResponse {
        @JsonProperty("access_token")
        private String accessToken;
        @JsonProperty("refresh_token")
        private String refreshToken;
        @JsonProperty("expires_in")
        private Integer expiresIn;
        private String openid;
        private String unionid;
        @JsonProperty("errcode")
        private Integer errorCode;
        @JsonProperty("errmsg")
        private String errorMessage;
    }
}
