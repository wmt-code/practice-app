package com.tb.practiceapp.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.tb.practiceapp.common.ApiResponse;
import com.tb.practiceapp.common.AuthUtils;
import com.tb.practiceapp.common.LoginRequired;
import com.tb.practiceapp.common.PageResponse;
import com.tb.practiceapp.model.vo.quiz.MyQuizRecordVO;
import com.tb.practiceapp.model.vo.quiz.QuizRankItemVO;
import com.tb.practiceapp.service.IUserQuizRecordService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/user-quiz-record")
@LoginRequired
@RequiredArgsConstructor
public class UserQuizRecordController {

    private final IUserQuizRecordService userQuizRecordService;

    @GetMapping("/my")
    public ApiResponse<PageResponse<MyQuizRecordVO>> myRecords(@RequestParam(defaultValue = "1") long page,
                                                               @RequestParam(defaultValue = "10") long size) {
        Page<MyQuizRecordVO> res = userQuizRecordService.pageMyRecords(AuthUtils.currentUserId(), page, size);
        PageResponse<MyQuizRecordVO> response = new PageResponse<>(res.getCurrent(), res.getSize(), res.getTotal(), res.getRecords());
        return ApiResponse.ok(response);
    }

    @GetMapping("/{quizId}/rank")
    public ApiResponse<PageResponse<QuizRankItemVO>> rank(@PathVariable Long quizId,
                                                          @RequestParam(defaultValue = "1") long page,
                                                          @RequestParam(defaultValue = "10") long size) {
        Page<QuizRankItemVO> res = userQuizRecordService.pageQuizRank(quizId, page, size);
        PageResponse<QuizRankItemVO> response = new PageResponse<>(res.getCurrent(), res.getSize(), res.getTotal(), res.getRecords());
        return ApiResponse.ok(response);
    }
}
