package com.tb.practiceapp.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.tb.practiceapp.common.PageResponse;
import com.tb.practiceapp.model.dto.answer.AnswerHistoryItem;
import com.tb.practiceapp.model.dto.answer.AnswerSubmitRequest;
import com.tb.practiceapp.model.entity.UserAnswer;

/**
 * <p>
 *  服务类
 * </p>
 *
 * @author wmt
 * @since 2025-12-02
 */
public interface IUserAnswerService extends IService<UserAnswer> {

    UserAnswer submitAnswer(Long userId, AnswerSubmitRequest request);

    PageResponse<AnswerHistoryItem> history(Long userId, long page, long size);
}
