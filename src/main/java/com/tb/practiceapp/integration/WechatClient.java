package com.tb.practiceapp.integration;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.tb.practiceapp.common.BusinessException;
import com.tb.practiceapp.common.ErrorCode;
import com.tb.practiceapp.config.WechatProperties;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
@RequiredArgsConstructor
@Slf4j
public class WechatClient {

    private final RestTemplate restTemplate;
    private final WechatProperties properties;
    private final ObjectMapper objectMapper;

    public WechatSession exchangeCode(String code) {
        if (StringUtils.isBlank(code)) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "微信授权code不能为空");
        }
        if (properties.isMockEnabled()) {
            return new WechatSession(properties.getMockOpenId(), null, properties.getMockSessionKey(), 7200);
        }
        if (StringUtils.isAnyBlank(properties.getAppId(), properties.getAppSecret())) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "微信配置缺失，请设置appId与appSecret");
        }
        String url = String.format(
                "https://api.weixin.qq.com/sns/jscode2session?appid=%s&secret=%s&js_code=%s&grant_type=%s",
                properties.getAppId(), properties.getAppSecret(), code, properties.getGrantType());
        try {
            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            WechatResponse body = parseBody(response);
            validateBody(body);
            return new WechatSession(body.getOpenid(), body.getUnionid(), body.getSessionKey(), body.getExpiresIn());
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            log.error(e.getMessage(), e);
            throw new BusinessException(ErrorCode.BAD_REQUEST, "微信接口调用失败：" + e.getMessage());
        }
    }

    private boolean isMockCode(String code) {
        String trimmed = StringUtils.trimToEmpty(code).toLowerCase();
        return "the code is a mock one".equals(trimmed);
    }

    private WechatResponse parseBody(ResponseEntity<String> response) {
        if (response == null || response.getBody() == null) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "微信认证返回为空");
        }
        try {
            return objectMapper.readValue(response.getBody(), WechatResponse.class);
        } catch (Exception ex) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "微信返回内容解析失败");
        }
    }

    private void validateBody(WechatResponse body) {
        if (body == null) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "微信认证返回为空");
        }
        if (body.getErrorCode() != null && body.getErrorCode() != 0) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "微信认证失败：" + body.getErrorMessage());
        }
        if (StringUtils.isAnyBlank(body.getOpenid(), body.getSessionKey())) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "微信未返回openid或session_key");
        }
    }

    @Data
    private static class WechatResponse {
        @JsonProperty("session_key")
        private String sessionKey;
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
