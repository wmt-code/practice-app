package com.tb.practiceapp.controller;

import com.tb.practiceapp.common.ApiResponse;
import com.tb.practiceapp.common.BusinessException;
import com.tb.practiceapp.common.ErrorCode;
import com.tb.practiceapp.model.dto.user.PasswordUpdateRequest;
import com.tb.practiceapp.model.dto.user.UserProfileUpdateRequest;
import com.tb.practiceapp.model.entity.User;
import com.tb.practiceapp.service.IUserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
public class UserController {

    private final IUserService userService;

    @GetMapping("/me")
    public ApiResponse<User> me() {
        return ApiResponse.ok(userService.getByIdCached(currentUserId()));
    }

    @PutMapping("/me")
    public ApiResponse<Void> updateProfile(@Valid @RequestBody UserProfileUpdateRequest request) {
        userService.updateProfile(currentUserId(), request);
        return ApiResponse.ok();
    }

    @PutMapping("/me/password")
    public ApiResponse<Void> updatePassword(@Valid @RequestBody PasswordUpdateRequest request) {
        userService.updatePassword(currentUserId(), request);
        return ApiResponse.ok();
    }

    private Long currentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getPrincipal() == null) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED, "未登录");
        }
        return (Long) authentication.getPrincipal();
    }
}
