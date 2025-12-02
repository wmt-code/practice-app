package com.tb.practiceapp.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.tb.practiceapp.mapper.UserWrongAnswersMapper;
import com.tb.practiceapp.model.entity.Question;
import com.tb.practiceapp.model.entity.UserWrongAnswers;
import com.tb.practiceapp.service.IUserWrongAnswersService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class UserWrongAnswersServiceImpl extends ServiceImpl<UserWrongAnswersMapper, UserWrongAnswers> implements IUserWrongAnswersService {

    @Override
    public void syncWrongAnswer(Long userId, Question question, String userAnswer, boolean correct) {
        LambdaQueryWrapper<UserWrongAnswers> wrapper = new LambdaQueryWrapper<UserWrongAnswers>()
                .eq(UserWrongAnswers::getUserId, userId)
                .eq(UserWrongAnswers::getQuestionId, question.getId());
        if (correct) {
            this.remove(wrapper);
            return;
        }
        UserWrongAnswers record = this.getOne(wrapper);
        if (record == null) {
            record = new UserWrongAnswers();
            record.setUserId(userId);
            record.setQuestionId(question.getId());
            record.setUserAnswer(userAnswer);
            record.setCorrectAnswer(question.getAnswer());
            record.setAttemptedAt(LocalDateTime.now());
            this.save(record);
        } else {
            record.setUserAnswer(userAnswer);
            record.setCorrectAnswer(question.getAnswer());
            record.setAttemptedAt(LocalDateTime.now());
            this.updateById(record);
        }
    }
}
