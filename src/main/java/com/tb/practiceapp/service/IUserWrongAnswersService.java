package com.tb.practiceapp.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.tb.practiceapp.model.entity.UserWrongAnswers;
import com.tb.practiceapp.model.entity.Question;
import com.tb.practiceapp.model.vo.answer.WrongQuestionVO;
import com.tb.practiceapp.model.vo.question.QuestionPracticeVO;

/**
 * <p>
 *  服务类
 * </p>
 *
 * @author wmt
 * @since 2025-12-02
 */
public interface IUserWrongAnswersService extends IService<UserWrongAnswers> {

    void syncWrongAnswer(Long userId, Question question, String userAnswer, boolean correct);

    com.baomidou.mybatisplus.extension.plugins.pagination.Page<WrongQuestionVO> pageWrong(Long userId, long page, long size);

    java.util.List<QuestionPracticeVO> listRetryQuestions(Long userId, java.util.List<Long> wrongIds);

    void clearAll(Long userId, Long categoryId);
}
