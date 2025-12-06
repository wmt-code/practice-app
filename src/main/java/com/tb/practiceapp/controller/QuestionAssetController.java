package com.tb.practiceapp.controller;

import com.tb.practiceapp.common.ApiResponse;
import com.tb.practiceapp.common.LoginRequired;
import com.tb.practiceapp.service.QuestionAssetStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/files/questions")
@RequiredArgsConstructor
@LoginRequired(roles = {"ADMIN"})
public class QuestionAssetController {

    private final QuestionAssetStorageService storageService;

    @PostMapping(consumes = { "multipart/form-data" })
    public ApiResponse<String> upload(@RequestParam("file") MultipartFile file) {
        String url = storageService.store(file);
        return ApiResponse.ok(url);
    }
}

