package com.tb.practiceapp.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.tb.practiceapp.common.ApiResponse;
import com.tb.practiceapp.common.AuthUtils;
import com.tb.practiceapp.common.LoginRequired;
import com.tb.practiceapp.common.PageResponse;
import com.tb.practiceapp.model.dto.answer.WrongRetryRequest;
import com.tb.practiceapp.model.vo.answer.WrongQuestionVO;
import com.tb.practiceapp.model.vo.question.QuestionPracticeVO;
import com.tb.practiceapp.service.IUserWrongAnswersService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/user-wrong-answers")
@LoginRequired
@RequiredArgsConstructor
public class UserWrongAnswersController {

    private final IUserWrongAnswersService wrongAnswersService;

    @GetMapping
    public ApiResponse<PageResponse<WrongQuestionVO>> list(@RequestParam(defaultValue = "1") long page,
                                                           @RequestParam(defaultValue = "10") long size) {
        Page<WrongQuestionVO> res = wrongAnswersService.pageWrong(AuthUtils.currentUserId(), page, size);
        PageResponse<WrongQuestionVO> response = new PageResponse<>(res.getCurrent(), res.getSize(), res.getTotal(), res.getRecords());
        return ApiResponse.ok(response);
    }

    @PostMapping("/retry")
    public ApiResponse<List<QuestionPracticeVO>> retry(@RequestBody(required = false) WrongRetryRequest request) {
        List<Long> ids = request == null ? null : request.getIds();
        return ApiResponse.ok(wrongAnswersService.listRetryQuestions(AuthUtils.currentUserId(), ids));
    }

    @DeleteMapping("/clear")
    public ApiResponse<Void> clear(@RequestParam(required = false) Long categoryId) {
        wrongAnswersService.clearAll(AuthUtils.currentUserId(), categoryId);
        return ApiResponse.ok();
    }
}
