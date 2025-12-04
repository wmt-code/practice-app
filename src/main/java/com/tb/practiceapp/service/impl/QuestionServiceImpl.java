package com.tb.practiceapp.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tb.practiceapp.common.BusinessException;
import com.tb.practiceapp.common.ErrorCode;
import com.tb.practiceapp.mapper.QuestionMapper;
import com.tb.practiceapp.model.dto.question.OptionDTO;
import com.tb.practiceapp.model.dto.question.QuestionCreateRequest;
import com.tb.practiceapp.model.dto.question.QuestionQueryRequest;
import com.tb.practiceapp.model.dto.question.QuestionUpdateRequest;
import com.tb.practiceapp.model.entity.Question;
import com.tb.practiceapp.model.vo.question.QuestionPracticeVO;
import com.tb.practiceapp.service.IQuestionService;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.StringUtils;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QuestionServiceImpl extends ServiceImpl<QuestionMapper, Question> implements IQuestionService {

    private final ObjectMapper objectMapper;

    @Override
    public Question createQuestion(QuestionCreateRequest request) {
        Question question = new Question();
        question.setTitle(request.getTitle());
        question.setType(request.getType());
        question.setAnswer(request.getAnswer());
        question.setOptionsJson(request.getOptions());
        question.setCategoryId(request.getCategoryId());
        question.setDifficulty(request.getDifficulty());
        question.setScore(request.getScore());
        question.setDuration(request.getDuration());
        question.setExplanation(request.getExplanation());
        question.setCreatedAt(LocalDateTime.now());
        question.setUpdatedAt(LocalDateTime.now());
        this.save(question);
        return question;
    }

    @Override
    public Question updateQuestion(QuestionUpdateRequest request) {
        Question question = this.getById(request.getId());
        if (question == null) {
            throw new BusinessException(ErrorCode.NOT_FOUND, "题目不存在");
        }
        question.setTitle(request.getTitle());
        question.setType(request.getType());
        question.setAnswer(request.getAnswer());
        question.setOptionsJson(request.getOptions());
        question.setCategoryId(request.getCategoryId());
        question.setDifficulty(request.getDifficulty());
        question.setScore(request.getScore());
        question.setDuration(request.getDuration());
        question.setExplanation(request.getExplanation());
        question.setUpdatedAt(LocalDateTime.now());
        this.updateById(question);
        return question;
    }

    @Override
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

    @Override
    public Page<QuestionPracticeVO> practiceSequence(Long categoryId, String difficulty, long page, long size) {
        Page<Question> p = new Page<>(page, size);
        LambdaQueryWrapper<Question> wrapper = new LambdaQueryWrapper<>();
        if (categoryId != null) {
            wrapper.eq(Question::getCategoryId, categoryId);
        }
        if (StringUtils.isNotBlank(difficulty)) {
            wrapper.eq(Question::getDifficulty, difficulty);
        }
        wrapper.orderByAsc(Question::getId);
        Page<Question> res = this.page(p, wrapper);
        Page<QuestionPracticeVO> voPage = new Page<>(res.getCurrent(), res.getSize(), res.getTotal());
        voPage.setRecords(res.getRecords().stream().map(this::convertToPracticeVO).collect(Collectors.toList()));
        return voPage;
    }

    @Override
    public List<QuestionPracticeVO> practiceRandom(Long categoryId, String difficulty, int limit) {
        LambdaQueryWrapper<Question> wrapper = new LambdaQueryWrapper<>();
        if (categoryId != null) {
            wrapper.eq(Question::getCategoryId, categoryId);
        }
        if (StringUtils.isNotBlank(difficulty)) {
            wrapper.eq(Question::getDifficulty, difficulty);
        }
        wrapper.last("ORDER BY RAND() LIMIT " + limit);
        return this.list(wrapper).stream()
                .map(this::convertToPracticeVO)
                .collect(Collectors.toList());
    }

    private QuestionPracticeVO convertToPracticeVO(Question question) {
        QuestionPracticeVO vo = new QuestionPracticeVO();
        vo.setId(question.getId());
        vo.setContent(question.getTitle());
        vo.setType(question.getType());
        vo.setDifficulty(question.getDifficulty());
        vo.setScore(question.getScore());
        vo.setDuration(question.getDuration());
        vo.setCategoryId(question.getCategoryId());
        vo.setExplanation(question.getExplanation());
        vo.setOptions(parseOptions(question.getOptionsJson()));
        return vo;
    }

    private List<OptionDTO> parseOptions(String optionsJson) {
        if (StringUtils.isBlank(optionsJson)) {
            return Collections.emptyList();
        }
        try {
            return objectMapper.readValue(optionsJson, new TypeReference<List<OptionDTO>>() {});
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }
}
