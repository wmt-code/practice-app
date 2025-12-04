package com.tb.practiceapp.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.tb.practiceapp.mapper.UserWrongAnswersMapper;
import com.tb.practiceapp.model.entity.Question;
import com.tb.practiceapp.model.entity.UserWrongAnswers;
import com.tb.practiceapp.model.vo.answer.WrongQuestionVO;
import com.tb.practiceapp.model.vo.question.QuestionPracticeVO;
import com.tb.practiceapp.service.IUserWrongAnswersService;
import com.tb.practiceapp.service.IQuestionService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserWrongAnswersServiceImpl extends ServiceImpl<UserWrongAnswersMapper, UserWrongAnswers> implements IUserWrongAnswersService {

    private final IQuestionService questionService;
    private final ObjectMapper objectMapper;

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
            record.setWrongCount(1);
            this.save(record);
        } else {
            record.setUserAnswer(userAnswer);
            record.setCorrectAnswer(question.getAnswer());
            record.setAttemptedAt(LocalDateTime.now());
            record.setWrongCount(record.getWrongCount() == null ? 1 : record.getWrongCount() + 1);
            this.updateById(record);
        }
    }

    @Override
    public com.baomidou.mybatisplus.extension.plugins.pagination.Page<WrongQuestionVO> pageWrong(Long userId, long page, long size) {
        com.baomidou.mybatisplus.extension.plugins.pagination.Page<WrongQuestionVO> p = new com.baomidou.mybatisplus.extension.plugins.pagination.Page<>(page, size);
        return this.baseMapper.pageWrong(p, userId);
    }

    @Override
    public List<QuestionPracticeVO> listRetryQuestions(Long userId, List<Long> wrongIds) {
        LambdaQueryWrapper<UserWrongAnswers> wrapper = new LambdaQueryWrapper<UserWrongAnswers>()
                .eq(UserWrongAnswers::getUserId, userId);
        if (wrongIds != null && !wrongIds.isEmpty()) {
            wrapper.in(UserWrongAnswers::getId, wrongIds);
        }
        List<UserWrongAnswers> wrongList = this.list(wrapper);
        if (wrongList.isEmpty()) {
            return Collections.emptyList();
        }
        List<Long> qids = wrongList.stream().map(UserWrongAnswers::getQuestionId).toList();
        Map<Long, Question> qMap = questionService.listByIds(qids).stream()
                .collect(Collectors.toMap(Question::getId, q -> q));
        return wrongList.stream()
                .map(w -> qMap.get(w.getQuestionId()))
                .filter(q -> q != null)
                .map(this::toPracticeVO)
                .toList();
    }

    @Override
    public void clearAll(Long userId, Long categoryId) {
        LambdaQueryWrapper<UserWrongAnswers> wrapper = new LambdaQueryWrapper<UserWrongAnswers>()
                .eq(UserWrongAnswers::getUserId, userId);
        if (categoryId != null) {
            List<Long> qids = questionService.lambdaQuery().eq(Question::getCategoryId, categoryId).list()
                    .stream().map(Question::getId).toList();
            if (qids.isEmpty()) {
                return;
            }
            wrapper.in(UserWrongAnswers::getQuestionId, qids);
        }
        this.remove(wrapper);
    }

    private QuestionPracticeVO toPracticeVO(Question q) {
        QuestionPracticeVO vo = new QuestionPracticeVO();
        vo.setId(q.getId());
        vo.setContent(q.getTitle());
        vo.setType(q.getType());
        vo.setDifficulty(q.getDifficulty());
        vo.setScore(q.getScore());
        vo.setDuration(q.getDuration());
        vo.setCategoryId(q.getCategoryId());
        vo.setExplanation(q.getExplanation());
        vo.setOptions(parseOptions(q.getOptionsJson()));
        return vo;
    }

    private List<com.tb.practiceapp.model.dto.question.OptionDTO> parseOptions(String json) {
        if (json == null || json.isBlank()) {
            return Collections.emptyList();
        }
        try {
            return objectMapper.readValue(json, new TypeReference<List<com.tb.practiceapp.model.dto.question.OptionDTO>>() {});
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }
}
