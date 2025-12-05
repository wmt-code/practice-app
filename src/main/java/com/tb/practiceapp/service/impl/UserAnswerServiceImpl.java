package com.tb.practiceapp.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.tb.practiceapp.common.BusinessException;
import com.tb.practiceapp.common.ErrorCode;
import com.tb.practiceapp.common.PageResponse;
import com.tb.practiceapp.mapper.UserAnswerMapper;
import com.tb.practiceapp.model.dto.answer.AnswerSubmitDTO;
import com.tb.practiceapp.model.entity.Question;
import com.tb.practiceapp.model.entity.UserAnswer;
import com.tb.practiceapp.model.vo.answer.AnswerHistoryVO;
import com.tb.practiceapp.model.vo.answer.AnswerResultVO;
import com.tb.practiceapp.service.IQuestionService;
import com.tb.practiceapp.service.IUserAnswerService;
import com.tb.practiceapp.service.IUserProgressService;
import com.tb.practiceapp.service.IUserWrongAnswersService;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserAnswerServiceImpl extends ServiceImpl<UserAnswerMapper, UserAnswer> implements IUserAnswerService {

    private final IQuestionService questionService;
    private final IUserProgressService userProgressService;
    private final IUserWrongAnswersService wrongAnswersService;

    @Override
    public AnswerResultVO submitAnswer(Long userId, AnswerSubmitDTO request) {
        Question question = questionService.getByIdCached(request.getQuestionId());
        if (question == null) {
            throw new BusinessException(ErrorCode.NOT_FOUND, "题目不存在");
        }
        List<String> userAnswers = normalizeOptions(request.getUserAnswerValues());
        List<String> correctAnswers = normalizeOptions(question.getAnswer());
        boolean correct = userAnswers.equals(correctAnswers);
        UserAnswer answer = new UserAnswer();
        answer.setUserId(userId);
        answer.setQuestionId(question.getId());
        answer.setCategoryId(question.getCategoryId());
        answer.setUserAnswer(String.join(",", request.getUserAnswerValues()));
        answer.setCorrect(correct ? 1 : 0);
        answer.setTimeSpent(request.getTimeSpent() == null ? 0 : request.getTimeSpent());
        answer.setAnsweredAt(LocalDateTime.now());
        this.save(answer);
        userProgressService.updateProgress(userId, question.getCategoryId(), correct);
        wrongAnswersService.syncWrongAnswer(userId, question, String.join(",", request.getUserAnswerValues()), correct);
        return buildResultVO(question, request.getUserAnswerValues(), correctAnswers, correct, answer.getTimeSpent(), answer.getAnsweredAt());
    }

    @Override
    public PageResponse<AnswerHistoryVO> history(Long userId, Long categoryId, long page, long size) {
        LambdaQueryWrapper<UserAnswer> wrapper = new LambdaQueryWrapper<UserAnswer>()
                .eq(UserAnswer::getUserId, userId)
                .orderByDesc(UserAnswer::getAnsweredAt);
        if (categoryId != null) {
            wrapper.eq(UserAnswer::getCategoryId, categoryId);
        }
        Page<UserAnswer> answerPage = this.page(new Page<>(page, size), wrapper);
        List<Long> questionIds = answerPage.getRecords().stream().map(UserAnswer::getQuestionId).toList();
        Map<Long, Question> questionMap = questionIds.isEmpty()
                ? Collections.emptyMap()
                : questionService.listByIds(questionIds).stream().collect(Collectors.toMap(Question::getId, q -> q));

        List<AnswerHistoryVO> items = answerPage.getRecords().stream()
                .map(record -> {
                    Question q = questionMap.get(record.getQuestionId());
                    AnswerHistoryVO vo = new AnswerHistoryVO();
                    vo.setQuestionId(record.getQuestionId());
                    vo.setCategoryId(record.getCategoryId());
                    vo.setQuestionTitle(q != null ? q.getTitle() : "");
                    boolean isCorrect = record.getCorrect() != null && record.getCorrect() == 1;
                    vo.setCorrect(isCorrect);
                    vo.setUserAnswer(record.getUserAnswer());
                    vo.setScore(q != null ? (isCorrect ? q.getScore() : 0) : 0);
                    vo.setTimeSpent(record.getTimeSpent());
                    vo.setDifficulty(q != null ? q.getDifficulty() : "");
                    vo.setAnsweredAt(record.getAnsweredAt());
                    return vo;
                })
                .toList();

        return new PageResponse<>(answerPage.getCurrent(), answerPage.getSize(), answerPage.getTotal(), items);
    }

    @Override
    public void clearCategoryHistory(Long userId, Long categoryId) {
        if (categoryId == null) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "分类ID不能为空");
        }
        this.remove(new LambdaQueryWrapper<UserAnswer>()
                .eq(UserAnswer::getUserId, userId)
                .eq(UserAnswer::getCategoryId, categoryId));
    }

    private AnswerResultVO buildResultVO(Question question, List<String> userAnswersRaw, List<String> correctAnswers, boolean correct, int timeSpent, LocalDateTime answeredAt) {
        AnswerResultVO vo = new AnswerResultVO();
        vo.setQuestionId(question.getId());
        vo.setQuestionTitle(question.getTitle());
        vo.setUserAnswer(userAnswersRaw);
        vo.setCorrectAnswer(correctAnswers);
        vo.setCorrect(correct);
        vo.setScore(correct ? (question.getScore() == null ? 0 : question.getScore()) : 0);
        vo.setTimeSpent(timeSpent);
        vo.setExplanation(question.getExplanation());
        vo.setDifficulty(question.getDifficulty());
        vo.setAnsweredAt(answeredAt);
        return vo;
    }

    private List<String> normalizeOptions(String value) {
        if (StringUtils.isBlank(value)) {
            return Collections.emptyList();
        }
        return java.util.Arrays.stream(value.split("[,;\\s]+"))
                .filter(StringUtils::isNotBlank)
                .map(s -> s.trim().toUpperCase())
                .sorted()
                .toList();
    }

    private List<String> normalizeOptions(List<String> values) {
        if (values == null || values.isEmpty()) {
            return Collections.emptyList();
        }
        return values.stream()
                .filter(StringUtils::isNotBlank)
                .map(s -> s.trim().toUpperCase())
                .sorted(Comparator.naturalOrder())
                .toList();
    }
}
