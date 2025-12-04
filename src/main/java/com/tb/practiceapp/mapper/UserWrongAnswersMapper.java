package com.tb.practiceapp.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.tb.practiceapp.model.vo.answer.WrongQuestionVO;
import com.tb.practiceapp.model.entity.UserWrongAnswers;
import org.apache.ibatis.annotations.Param;

/**
 * <p>
 *  Mapper 接口
 * </p>
 *
 * @author wmt
 * @since 2025-12-02
 */
public interface UserWrongAnswersMapper extends BaseMapper<UserWrongAnswers> {

    Page<WrongQuestionVO> pageWrong(Page<WrongQuestionVO> page, @Param("userId") Long userId);
}
