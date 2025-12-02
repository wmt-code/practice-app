package com.tb.practiceapp.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.tb.practiceapp.common.BusinessException;
import com.tb.practiceapp.common.ErrorCode;
import com.tb.practiceapp.mapper.QuestionMapper;
import com.tb.practiceapp.model.dto.question.QuestionCreateRequest;
import com.tb.practiceapp.model.dto.question.QuestionQueryRequest;
import com.tb.practiceapp.model.dto.question.QuestionUpdateRequest;
import com.tb.practiceapp.model.entity.Question;
import com.tb.practiceapp.service.IQuestionService;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.StringUtils;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class QuestionServiceImpl extends ServiceImpl<QuestionMapper, Question> implements IQuestionService {

    @Override
    public Question createQuestion(QuestionCreateRequest request) {
        Question question = new Question();
        question.setTitle(request.getTitle());
        question.setType(request.getType());
        question.setAnswer(request.getAnswer());
        question.setOptions(request.getOptions());
        question.setCategoryId(request.getCategoryId());
        question.setDifficulty(request.getDifficulty());
        question.setCreatedAt(LocalDateTime.now());
        question.setUpdatedAt(LocalDateTime.now());
        this.save(question);
        return question;
    }

    @Override
    @CacheEvict(value = "questions", key = "#request.id")
    public Question updateQuestion(QuestionUpdateRequest request) {
        Question question = this.getById(request.getId());
        if (question == null) {
            throw new BusinessException(ErrorCode.NOT_FOUND, "题目不存在");
        }
        question.setTitle(request.getTitle());
        question.setType(request.getType());
        question.setAnswer(request.getAnswer());
        question.setOptions(request.getOptions());
        question.setCategoryId(request.getCategoryId());
        question.setDifficulty(request.getDifficulty());
        question.setUpdatedAt(LocalDateTime.now());
        this.updateById(question);
        return question;
    }

    @Override
    @CacheEvict(value = "questions", key = "#id")
    public void deleteQuestion(Long id) {
        if (!this.removeById(id)) {
            throw new BusinessException(ErrorCode.NOT_FOUND, "题目不存在");
        }
    }

    @Override
    @Cacheable(value = "questions", key = "#id")
    public Question getByIdCached(Long id) {
        return this.getById(id);
    }

    @Override
    public Page<Question> query(QuestionQueryRequest request) {
        Page<Question> page = new Page<>(request.getPage(), request.getSize());
        LambdaQueryWrapper<Question> wrapper = new LambdaQueryWrapper<>();
        if (request.getCategoryId() != null) {
            wrapper.eq(Question::getCategoryId, request.getCategoryId());
        }
        if (StringUtils.isNotBlank(request.getDifficulty())) {
            wrapper.eq(Question::getDifficulty, request.getDifficulty());
        }
        if (StringUtils.isNotBlank(request.getKeyword())) {
            wrapper.like(Question::getTitle, request.getKeyword());
        }
        wrapper.orderByDesc(Question::getUpdatedAt);
        return this.page(page, wrapper);
    }
}
