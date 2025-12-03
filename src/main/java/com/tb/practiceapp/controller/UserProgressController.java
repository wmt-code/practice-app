package com.tb.practiceapp.controller;

import com.tb.practiceapp.common.ApiResponse;
import com.tb.practiceapp.common.AuthUtils;
import com.tb.practiceapp.common.LoginRequired;
import com.tb.practiceapp.model.dto.progress.ProgressResponse;
import com.tb.practiceapp.service.IUserProgressService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/progress")
@RequiredArgsConstructor
@LoginRequired
public class UserProgressController {

    private final IUserProgressService userProgressService;

    @GetMapping
    public ApiResponse<List<ProgressResponse>> progress() {
        return ApiResponse.ok(userProgressService.getProgress(AuthUtils.currentUserId()));
    }
}
