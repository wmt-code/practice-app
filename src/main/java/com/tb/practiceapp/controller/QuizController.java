package com.tb.practiceapp.controller;


import com.tb.practiceapp.common.LoginRequired;
import com.tb.practiceapp.common.ApiResponse;
import com.tb.practiceapp.common.AuthUtils;
import com.tb.practiceapp.model.dto.quiz.QuizCreateDTO;
import com.tb.practiceapp.model.dto.quiz.QuizSubmitDTO;
import com.tb.practiceapp.model.vo.quiz.QuizDetailVO;
import com.tb.practiceapp.model.vo.quiz.QuizPaperVO;
import com.tb.practiceapp.model.vo.quiz.QuizStatsVO;
import com.tb.practiceapp.model.vo.quiz.QuizSubmitResultVO;
import com.tb.practiceapp.service.IQuizService;
import com.tb.practiceapp.service.IUserQuizRecordService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestBody;

/**
 * <p>
 *  前端控制器
 * </p>
 *
 * @author wmt
 * @since 2025-12-02
 */
@RestController
@RequestMapping("/quizzes")
@LoginRequired
@RequiredArgsConstructor
public class QuizController {

    private final IQuizService quizService;
    private final IUserQuizRecordService userQuizRecordService;

    @PostMapping
    public ApiResponse<QuizDetailVO> create(@RequestBody QuizCreateDTO dto) {
        return ApiResponse.ok(quizService.createOrUpdate(dto));
    }

    @PostMapping("/{id}/publish")
    public ApiResponse<Void> publish(@PathVariable Long id) {
        quizService.publish(id);
        return ApiResponse.ok();
    }

    @GetMapping("/available")
    public ApiResponse<java.util.List<QuizDetailVO>> available() {
        return ApiResponse.ok(quizService.listAvailable());
    }

    @GetMapping("/{id}/paper")
    public ApiResponse<QuizPaperVO> paper(@PathVariable Long id) {
        return ApiResponse.ok(quizService.getPaper(id));
    }

    @PostMapping("/{id}/submit")
    public ApiResponse<QuizSubmitResultVO> submit(@PathVariable Long id,
                                                  @RequestBody QuizSubmitDTO dto) {
        Long userId = AuthUtils.currentUserId();
        return ApiResponse.ok(quizService.submit(id, userId, dto));
    }

    @GetMapping("/{id}/stats")
    public ApiResponse<QuizStatsVO> stats(@PathVariable Long id) {
        return ApiResponse.ok(quizService.stats(id));
    }

}
