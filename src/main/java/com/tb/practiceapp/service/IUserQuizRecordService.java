package com.tb.practiceapp.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import com.tb.practiceapp.model.entity.UserQuizRecord;
import com.tb.practiceapp.model.vo.quiz.MyQuizRecordVO;
import com.tb.practiceapp.model.vo.quiz.QuizRankItemVO;

import java.time.LocalDateTime;

public interface IUserQuizRecordService extends IService<UserQuizRecord> {

    void saveRecord(Long userId, Long quizId, Integer score, Integer duration, LocalDateTime startTime, LocalDateTime endTime);

    Page<MyQuizRecordVO> pageMyRecords(Long userId, long page, long size);

    Page<QuizRankItemVO> pageQuizRank(Long quizId, long page, long size);
}
