package com.tb.practiceapp.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.tb.practiceapp.model.entity.UserWrongAnswers;
import com.tb.practiceapp.model.entity.Question;

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
}
