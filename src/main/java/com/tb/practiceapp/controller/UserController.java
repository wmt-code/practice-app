package com.tb.practiceapp.controller;

import com.tb.practiceapp.common.ApiResponse;
import com.tb.practiceapp.common.AuthUtils;
import com.tb.practiceapp.common.LoginRequired;
import com.tb.practiceapp.model.dto.user.AvatarUploadRequest;
import com.tb.practiceapp.model.dto.user.PasswordUpdateRequest;
import com.tb.practiceapp.model.dto.user.UserProfileUpdateRequest;
import com.tb.practiceapp.model.entity.User;
import com.tb.practiceapp.service.IUserService;
import com.tb.practiceapp.service.AvatarStorageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
@LoginRequired
@Slf4j
public class UserController {

    private final IUserService userService;
    private final AvatarStorageService avatarStorageService;

    @GetMapping("/me")
    public ApiResponse<User> me() {
        return ApiResponse.ok(userService.getByIdCached(AuthUtils.currentUserId()));
    }

    @PutMapping("/me")
    public ApiResponse<Void> updateProfile(@Valid @RequestBody UserProfileUpdateRequest request) {
        userService.updateProfile(AuthUtils.currentUserId(), request);
        return ApiResponse.ok();
    }

    @PutMapping("/me/password")
    public ApiResponse<Void> updatePassword(@Valid @RequestBody PasswordUpdateRequest request) {
        userService.updatePassword(AuthUtils.currentUserId(), request);
        return ApiResponse.ok();
    }

    @PostMapping(value = "/me/avatar", consumes = { "multipart/form-data", "application/json" })
    public ApiResponse<String> uploadAvatar(
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam(value = "avatarUrl", required = false) String avatarUrl,
            @RequestBody(required = false) AvatarUploadRequest avatarBody) {
        Long userId = AuthUtils.currentUserId();
        String resolvedUrl = StringUtils.defaultIfBlank(avatarUrl, avatarBody != null ? avatarBody.getAvatarUrl() : null);
        String url;
        if (file != null && !file.isEmpty()) {
            url = avatarStorageService.storeAvatar(userId, file);
        } else if (StringUtils.isNotBlank(resolvedUrl)) {
            url = resolvedUrl;
        } else {
            throw new com.tb.practiceapp.common.BusinessException(com.tb.practiceapp.common.ErrorCode.BAD_REQUEST, "头像文件不能为空");
        }
        userService.updateAvatar(userId, url);
        return ApiResponse.ok(url);
    }
}
