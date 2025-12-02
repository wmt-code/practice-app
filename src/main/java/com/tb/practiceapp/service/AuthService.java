package com.tb.practiceapp.service;

import com.tb.practiceapp.model.dto.auth.LoginResponse;
import com.tb.practiceapp.model.dto.auth.PasswordLoginRequest;
import com.tb.practiceapp.model.dto.auth.WechatLoginRequest;

public interface AuthService {
    LoginResponse loginWithWechat(WechatLoginRequest request);

    LoginResponse loginWithPassword(PasswordLoginRequest request);

    LoginResponse refresh(String refreshToken);
}
