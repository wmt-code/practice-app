package com.tb.practiceapp.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.tb.practiceapp.model.dto.question.QuestionCreateRequest;
import com.tb.practiceapp.model.dto.question.QuestionQueryRequest;
import com.tb.practiceapp.model.dto.question.QuestionUpdateRequest;
import com.tb.practiceapp.model.entity.Question;

/**
 * <p>
 *  服务类
 * </p>
 *
 * @author wmt
 * @since 2025-12-02
 */
public interface IQuestionService extends IService<Question> {

    Question createQuestion(QuestionCreateRequest request);

    Question updateQuestion(QuestionUpdateRequest request);

    void deleteQuestion(Long id);

    Question getByIdCached(Long id);

    Page<Question> query(QuestionQueryRequest request);
}
