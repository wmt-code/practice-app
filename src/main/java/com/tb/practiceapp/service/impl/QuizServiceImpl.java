package com.tb.practiceapp.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tb.practiceapp.common.BusinessException;
import com.tb.practiceapp.common.ErrorCode;
import com.tb.practiceapp.mapper.QuizMapper;
import com.tb.practiceapp.model.dto.answer.AnswerSubmitDTO;
import com.tb.practiceapp.model.dto.quiz.QuizCreateDTO;
import com.tb.practiceapp.model.dto.quiz.QuizSubmitDTO;
import com.tb.practiceapp.model.entity.Question;
import com.tb.practiceapp.model.entity.Quiz;
import com.tb.practiceapp.model.entity.UserQuizRecord;
import com.tb.practiceapp.model.vo.quiz.QuizDetailVO;
import com.tb.practiceapp.model.vo.quiz.QuizPaperVO;
import com.tb.practiceapp.model.vo.quiz.QuizStatsVO;
import com.tb.practiceapp.model.vo.quiz.QuizSubmitResultVO;
import com.tb.practiceapp.model.vo.question.QuestionPracticeVO;
import com.tb.practiceapp.service.IQuizService;
import com.tb.practiceapp.service.IQuestionService;
import com.tb.practiceapp.service.IUserQuizRecordService;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QuizServiceImpl extends ServiceImpl<QuizMapper, Quiz> implements IQuizService {

    private final ObjectMapper objectMapper;
    private final IQuestionService questionService;
    private final IUserQuizRecordService userQuizRecordService;

    @Override
    public QuizDetailVO createOrUpdate(QuizCreateDTO dto) {
        Quiz quiz = dto.getId() == null ? new Quiz() : this.getById(dto.getId());
        if (dto.getId() != null && quiz == null) {
            throw new BusinessException(ErrorCode.NOT_FOUND, "测验不存在");
        }
        quiz.setTitle(dto.getTitle());
        quiz.setDescription(dto.getDescription());
        quiz.setCategoryId(dto.getCategoryId());
        quiz.setStartTime(dto.getStartTime());
        quiz.setEndTime(dto.getEndTime());
        quiz.setTotalScore(dto.getTotalScore());
        quiz.setTimeLimit(dto.getTimeLimit());
        quiz.setQuestionIds(writeQuestionIds(dto.getQuestionIds()));
        quiz.setStatus(StringUtils.defaultIfBlank(quiz.getStatus(), "DRAFT"));
        if (quiz.getCreatedAt() == null) {
            quiz.setCreatedAt(LocalDateTime.now());
        }
        this.saveOrUpdate(quiz);
        return toDetailVO(quiz);
    }

    @Override
    public void publish(Long id) {
        Quiz quiz = this.getById(id);
        if (quiz == null) {
            throw new BusinessException(ErrorCode.NOT_FOUND, "测验不存在");
        }
        quiz.setStatus("PUBLISHED");
        this.updateById(quiz);
    }

    @Override
    public List<QuizDetailVO> listAvailable() {
        LocalDateTime now = LocalDateTime.now();
        LambdaQueryWrapper<Quiz> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Quiz::getStatus, "PUBLISHED")
                .le(Quiz::getStartTime, now)
                .ge(Quiz::getEndTime, now);
        return this.list(wrapper).stream()
                .sorted(Comparator.comparing(Quiz::getStartTime, Comparator.nullsLast(LocalDateTime::compareTo)))
                .map(this::toDetailVO)
                .toList();
    }

    @Override
    public QuizPaperVO getPaper(Long id) {
        Quiz quiz = this.getById(id);
        if (quiz == null) {
            throw new BusinessException(ErrorCode.NOT_FOUND, "测验不存在");
        }
        List<Long> questionIds = readQuestionIds(quiz.getQuestionIds());
        if (questionIds.isEmpty()) {
            throw new BusinessException(ErrorCode.SERVER_ERROR, "试卷未配置题目");
        }
        Map<Long, Question> questionMap = questionService.listByIds(questionIds).stream()
                .collect(Collectors.toMap(Question::getId, q -> q));
        List<QuestionPracticeVO> questions = new ArrayList<>();
        for (Long qid : questionIds) {
            Question q = questionMap.get(qid);
            if (q != null) {
                questions.add(toPracticeVO(q));
            }
        }
        QuizPaperVO vo = new QuizPaperVO();
        vo.setId(quiz.getId());
        vo.setTitle(quiz.getTitle());
        vo.setDescription(quiz.getDescription());
        vo.setStatus(quiz.getStatus());
        vo.setCategoryId(quiz.getCategoryId());
        vo.setStartTime(quiz.getStartTime());
        vo.setEndTime(quiz.getEndTime());
        vo.setTimeLimit(quiz.getTimeLimit());
        vo.setTotalScore(quiz.getTotalScore());
        vo.setQuestions(questions);
        return vo;
    }

    @Override
    @Transactional
    public QuizSubmitResultVO submit(Long quizId, Long userId, QuizSubmitDTO dto) {
        Quiz quiz = this.getById(quizId);
        if (quiz == null || !"PUBLISHED".equalsIgnoreCase(quiz.getStatus())) {
            throw new BusinessException(ErrorCode.NOT_FOUND, "测验不存在或未发布");
        }
        List<Long> quizQuestionIds = readQuestionIds(quiz.getQuestionIds());
        Map<Long, Question> questionMap = questionService.listByIds(quizQuestionIds).stream()
                .collect(Collectors.toMap(Question::getId, q -> q));
        int obtainedScore = 0;
        int correctCount = 0;
        List<AnswerSubmitDTO> answers = dto.getAnswers() == null ? Collections.emptyList() : dto.getAnswers();
        for (AnswerSubmitDTO ans : answers) {
            Question q = questionMap.get(ans.getQuestionId());
            if (q == null) {
                continue;
            }
            List<String> user = normalize(ans.getUserAnswerValues());
            List<String> std = normalize(q.getAnswer());
            boolean correct = user.equals(std);
            if (correct) {
                correctCount++;
                obtainedScore += q.getScore() == null ? 0 : q.getScore();
            }
        }
        int wrongCount = quizQuestionIds.size() - correctCount;
        LocalDateTime end = LocalDateTime.now();
        int duration = dto.getDuration() == null ? 0 : dto.getDuration();
        LocalDateTime start = end.minusSeconds(duration);
        userQuizRecordService.saveRecord(userId, quizId, obtainedScore, duration, start, end);

        QuizSubmitResultVO vo = new QuizSubmitResultVO();
        vo.setQuizId(quizId);
        vo.setObtainedScore(obtainedScore);
        vo.setTotalScore(quiz.getTotalScore());
        vo.setCorrectCount(correctCount);
        vo.setWrongCount(wrongCount);
        return vo;
    }

    @Override
    public QuizStatsVO stats(Long quizId) {
        List<UserQuizRecord> records = userQuizRecordService.list(new LambdaQueryWrapper<UserQuizRecord>()
                .eq(UserQuizRecord::getQuizId, quizId));
        QuizStatsVO vo = new QuizStatsVO();
        vo.setQuizId(quizId);
        if (records.isEmpty()) {
            vo.setParticipants(0L);
            vo.setAvgScore(0D);
            vo.setMaxScore(0);
            vo.setMinScore(0);
            return vo;
        }
        vo.setParticipants((long) records.size());
        vo.setMaxScore(records.stream().map(UserQuizRecord::getScore).max(Integer::compareTo).orElse(0));
        vo.setMinScore(records.stream().map(UserQuizRecord::getScore).min(Integer::compareTo).orElse(0));
        double avg = records.stream().mapToInt(UserQuizRecord::getScore).average().orElse(0);
        vo.setAvgScore(avg);
        return vo;
    }

    private QuizDetailVO toDetailVO(Quiz quiz) {
        QuizDetailVO vo = new QuizDetailVO();
        vo.setId(quiz.getId());
        vo.setTitle(quiz.getTitle());
        vo.setDescription(quiz.getDescription());
        vo.setStatus(quiz.getStatus());
        vo.setCategoryId(quiz.getCategoryId());
        vo.setStartTime(quiz.getStartTime());
        vo.setEndTime(quiz.getEndTime());
        vo.setTimeLimit(quiz.getTimeLimit());
        vo.setTotalScore(quiz.getTotalScore());
        List<Long> qids = readQuestionIds(quiz.getQuestionIds());
        vo.setQuestionCount(qids.size());
        return vo;
    }

    private List<Long> readQuestionIds(String json) {
        if (StringUtils.isBlank(json)) {
            return Collections.emptyList();
        }
        try {
            return objectMapper.readValue(json, new TypeReference<List<Long>>() {});
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }

    private String writeQuestionIds(List<Long> ids) {
        if (ids == null) {
            return "[]";
        }
        try {
            return objectMapper.writeValueAsString(ids);
        } catch (Exception e) {
            return "[]";
        }
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
        vo.setExplanation(null); // 不返回答案解析
        vo.setOptions(parseOptions(q.getOptionsJson()));
        return vo;
    }

    private List<com.tb.practiceapp.model.dto.question.OptionDTO> parseOptions(String optionsJson) {
        if (StringUtils.isBlank(optionsJson)) {
            return Collections.emptyList();
        }
        try {
            return objectMapper.readValue(optionsJson, new TypeReference<List<com.tb.practiceapp.model.dto.question.OptionDTO>>() {});
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }

    private List<String> normalize(String raw) {
        if (StringUtils.isBlank(raw)) {
            return Collections.emptyList();
        }
        return java.util.Arrays.stream(raw.split("[,;\\s]+"))
                .filter(StringUtils::isNotBlank)
                .map(s -> s.trim().toUpperCase())
                .sorted()
                .toList();
    }

    private List<String> normalize(List<String> raw) {
        if (raw == null) {
            return Collections.emptyList();
        }
        return raw.stream()
                .filter(StringUtils::isNotBlank)
                .map(s -> s.trim().toUpperCase())
                .sorted()
                .toList();
    }
}
