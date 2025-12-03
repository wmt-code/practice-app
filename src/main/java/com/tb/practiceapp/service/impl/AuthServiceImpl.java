package com.tb.practiceapp.service.impl;

import com.tb.practiceapp.common.BusinessException;
import com.tb.practiceapp.common.ErrorCode;
import com.tb.practiceapp.integration.WechatClient;
import com.tb.practiceapp.integration.WechatSession;
import com.tb.practiceapp.model.dto.auth.LoginResponse;
import com.tb.practiceapp.model.dto.auth.PasswordLoginRequest;
import com.tb.practiceapp.model.dto.auth.WechatLoginRequest;
import com.tb.practiceapp.model.entity.User;
import com.tb.practiceapp.security.JwtTokenProvider;
import com.tb.practiceapp.service.AuthService;
import com.tb.practiceapp.service.IUserService;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.StringUtils;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final IUserService userService;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final WechatClient wechatClient;

    @Override
    public LoginResponse loginWithWechat(WechatLoginRequest request) {
        WechatSession session = wechatClient.exchangeCode(request.getCode());
        User user = userService.ensureUserFromWechat(session.getOpenId(), session.getUnionId(),
                session.getSessionKey(), session.getExpiresIn(), request.getNickname(), request.getAvatar());
        return toResponse(user);
    }

    @Override
    public LoginResponse loginWithPassword(PasswordLoginRequest request) {
        User user = userService.findByUsername(request.getUsername());
        if (user == null) {
            throw new BusinessException(ErrorCode.NOT_FOUND, "用户不存在");
        }
        if (!Integer.valueOf(1).equals(user.getStatus())) {
            throw new BusinessException(ErrorCode.FORBIDDEN, "账号已被禁用");
        }
        if (StringUtils.isBlank(user.getPassword()) || !passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED, "用户名或密码错误");
        }
        return toResponse(user);
    }

    @Override
    public LoginResponse refresh(String refreshToken) {
        Claims claims;
        try {
            claims = jwtTokenProvider.parse(refreshToken);
        } catch (JwtException e) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED, "刷新令牌无效");
        }
        String type = claims.get("type", String.class);
        if (!"refresh".equals(type)) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED, "非法的刷新令牌");
        }
        Long userId = Long.valueOf(claims.getSubject());
        User user = userService.getByIdCached(userId);
        if (user == null) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED, "用户不存在");
        }
        return toResponse(user);
    }

    private LoginResponse toResponse(User user) {
        String accessToken = jwtTokenProvider.generateAccessToken(user);
        String refreshToken = jwtTokenProvider.generateRefreshToken(user);
        return new LoginResponse(accessToken, refreshToken, user);
    }
}
