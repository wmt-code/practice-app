package com.tb.practiceapp.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.tb.practiceapp.common.PageResponse;
import com.tb.practiceapp.model.entity.UserAnswer;
import com.tb.practiceapp.model.dto.answer.AnswerSubmitDTO;
import com.tb.practiceapp.model.vo.answer.AnswerHistoryVO;
import com.tb.practiceapp.model.vo.answer.AnswerResultVO;

/**
 * <p>
 *  服务类
 * </p>
 *
 * @author wmt
 * @since 2025-12-02
 */
public interface IUserAnswerService extends IService<UserAnswer> {

    AnswerResultVO submitAnswer(Long userId, AnswerSubmitDTO request);

    PageResponse<AnswerHistoryVO> history(Long userId, long page, long size);
}
