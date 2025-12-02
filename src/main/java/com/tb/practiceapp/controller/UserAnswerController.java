package com.tb.practiceapp.controller;

import com.tb.practiceapp.common.ApiResponse;
import com.tb.practiceapp.common.BusinessException;
import com.tb.practiceapp.common.ErrorCode;
import com.tb.practiceapp.common.PageResponse;
import com.tb.practiceapp.model.dto.answer.AnswerHistoryItem;
import com.tb.practiceapp.model.dto.answer.AnswerSubmitRequest;
import com.tb.practiceapp.model.entity.UserAnswer;
import com.tb.practiceapp.service.IUserAnswerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/answers")
@RequiredArgsConstructor
public class UserAnswerController {

    private final IUserAnswerService userAnswerService;

    @PostMapping
    public ApiResponse<UserAnswer> submit(@Valid @RequestBody AnswerSubmitRequest request) {
        return ApiResponse.ok(userAnswerService.submitAnswer(currentUserId(), request));
    }

    @GetMapping("/history")
    public ApiResponse<PageResponse<AnswerHistoryItem>> history(@RequestParam(defaultValue = "1") long page,
                                                                @RequestParam(defaultValue = "10") long size) {
        return ApiResponse.ok(userAnswerService.history(currentUserId(), page, size));
    }

    private Long currentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getPrincipal() == null) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED, "未登录");
        }
        return (Long) authentication.getPrincipal();
    }
}
