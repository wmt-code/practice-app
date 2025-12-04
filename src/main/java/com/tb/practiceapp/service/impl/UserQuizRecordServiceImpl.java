package com.tb.practiceapp.service.impl;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.tb.practiceapp.mapper.UserQuizRecordMapper;
import com.tb.practiceapp.model.entity.UserQuizRecord;
import com.tb.practiceapp.model.vo.quiz.MyQuizRecordVO;
import com.tb.practiceapp.model.vo.quiz.QuizRankItemVO;
import com.tb.practiceapp.service.IUserQuizRecordService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class UserQuizRecordServiceImpl extends ServiceImpl<UserQuizRecordMapper, UserQuizRecord> implements IUserQuizRecordService {

    @Override
    public void saveRecord(Long userId, Long quizId, Integer score, Integer duration, LocalDateTime startTime, LocalDateTime endTime) {
        UserQuizRecord record = new UserQuizRecord();
        record.setUserId(userId);
        record.setQuizId(quizId);
        record.setScore(score);
        record.setDuration(duration);
        record.setStartTime(startTime);
        record.setEndTime(endTime);
        record.setCreatedAt(LocalDateTime.now());
        this.save(record);
    }

    @Override
    public Page<MyQuizRecordVO> pageMyRecords(Long userId, long page, long size) {
        Page<MyQuizRecordVO> p = new Page<>(page, size);
        return this.baseMapper.pageMyRecords(p, userId);
        }

    @Override
    public Page<QuizRankItemVO> pageQuizRank(Long quizId, long page, long size) {
        Page<QuizRankItemVO> p = new Page<>(page, size);
        return this.baseMapper.pageQuizRank(p, quizId);
    }
}
