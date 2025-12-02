package com.tb.practiceapp.controller;

import com.tb.practiceapp.common.ApiResponse;
import com.tb.practiceapp.model.dto.auth.LoginResponse;
import com.tb.practiceapp.model.dto.auth.PasswordLoginRequest;
import com.tb.practiceapp.model.dto.auth.WechatLoginRequest;
import com.tb.practiceapp.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/wechat")
    public ApiResponse<LoginResponse> wechatLogin(@Valid @RequestBody WechatLoginRequest request) {
        return ApiResponse.ok(authService.loginWithWechat(request));
    }

    @PostMapping("/login")
    public ApiResponse<LoginResponse> passwordLogin(@Valid @RequestBody PasswordLoginRequest request) {
        return ApiResponse.ok(authService.loginWithPassword(request));
    }

    @PostMapping("/refresh")
    public ApiResponse<LoginResponse> refresh(@RequestParam String refreshToken) {
        return ApiResponse.ok(authService.refresh(refreshToken));
    }
}
