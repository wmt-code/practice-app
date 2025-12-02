package com.tb.practiceapp.controller;

import com.tb.practiceapp.common.ApiResponse;
import com.tb.practiceapp.common.BusinessException;
import com.tb.practiceapp.common.ErrorCode;
import com.tb.practiceapp.model.dto.progress.ProgressResponse;
import com.tb.practiceapp.service.IUserProgressService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/progress")
@RequiredArgsConstructor
public class UserProgressController {

    private final IUserProgressService userProgressService;

    @GetMapping
    public ApiResponse<List<ProgressResponse>> progress() {
        return ApiResponse.ok(userProgressService.getProgress(currentUserId()));
    }

    private Long currentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getPrincipal() == null) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED, "未登录");
        }
        return (Long) authentication.getPrincipal();
    }
}
