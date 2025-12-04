package com.tb.practiceapp.controller;

import com.tb.practiceapp.common.ApiResponse;
import com.tb.practiceapp.common.AuthUtils;
import com.tb.practiceapp.common.LoginRequired;
import com.tb.practiceapp.common.PageResponse;
import com.tb.practiceapp.model.dto.answer.AnswerSubmitDTO;
import com.tb.practiceapp.model.vo.answer.AnswerHistoryVO;
import com.tb.practiceapp.model.vo.answer.AnswerResultVO;
import com.tb.practiceapp.service.IUserAnswerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/answers")
@RequiredArgsConstructor
@LoginRequired
public class UserAnswerController {

    private final IUserAnswerService userAnswerService;

    @PostMapping("/submit")
    public ApiResponse<AnswerResultVO> submit(@Valid @RequestBody AnswerSubmitDTO request) {
        return ApiResponse.ok(userAnswerService.submitAnswer(AuthUtils.currentUserId(), request));
    }

    @GetMapping("/history")
    public ApiResponse<PageResponse<AnswerHistoryVO>> history(@RequestParam(defaultValue = "1") long page,
                                                              @RequestParam(defaultValue = "10") long size) {
        return ApiResponse.ok(userAnswerService.history(AuthUtils.currentUserId(), page, size));
    }
}
