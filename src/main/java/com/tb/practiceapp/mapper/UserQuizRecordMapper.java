package com.tb.practiceapp.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.tb.practiceapp.model.entity.UserQuizRecord;
import com.tb.practiceapp.model.vo.quiz.MyQuizRecordVO;
import com.tb.practiceapp.model.vo.quiz.QuizRankItemVO;
import org.apache.ibatis.annotations.Param;

public interface UserQuizRecordMapper extends BaseMapper<UserQuizRecord> {

    Page<MyQuizRecordVO> pageMyRecords(Page<MyQuizRecordVO> page, @Param("userId") Long userId);

    Page<QuizRankItemVO> pageQuizRank(Page<QuizRankItemVO> page, @Param("quizId") Long quizId);
}
