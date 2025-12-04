package com.tb.practiceapp.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.tb.practiceapp.model.entity.Quiz;
import com.tb.practiceapp.model.dto.quiz.QuizCreateDTO;
import com.tb.practiceapp.model.dto.quiz.QuizSubmitDTO;
import com.tb.practiceapp.model.vo.quiz.QuizDetailVO;
import com.tb.practiceapp.model.vo.quiz.QuizPaperVO;
import com.tb.practiceapp.model.vo.quiz.QuizStatsVO;
import com.tb.practiceapp.model.vo.quiz.QuizSubmitResultVO;

import java.util.List;

/**
 * <p>
 *  服务类
 * </p>
 *
 * @author wmt
 * @since 2025-12-02
 */
public interface IQuizService extends IService<Quiz> {

    QuizDetailVO createOrUpdate(QuizCreateDTO dto);

    void publish(Long id);

    List<QuizDetailVO> listAvailable();

    QuizPaperVO getPaper(Long id);

    QuizSubmitResultVO submit(Long quizId, Long userId, QuizSubmitDTO dto);

    QuizStatsVO stats(Long quizId);
}
