package com.tb.practiceapp.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.tb.practiceapp.common.BusinessException;
import com.tb.practiceapp.common.ErrorCode;
import com.tb.practiceapp.common.PageResponse;
import com.tb.practiceapp.mapper.UserAnswerMapper;
import com.tb.practiceapp.model.dto.answer.AnswerHistoryItem;
import com.tb.practiceapp.model.dto.answer.AnswerSubmitRequest;
import com.tb.practiceapp.model.entity.Question;
import com.tb.practiceapp.model.entity.UserAnswer;
import com.tb.practiceapp.service.IQuestionService;
import com.tb.practiceapp.service.IUserAnswerService;
import com.tb.practiceapp.service.IUserProgressService;
import com.tb.practiceapp.service.IUserWrongAnswersService;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserAnswerServiceImpl extends ServiceImpl<UserAnswerMapper, UserAnswer> implements IUserAnswerService {

    private final IQuestionService questionService;
    private final IUserProgressService userProgressService;
    private final IUserWrongAnswersService wrongAnswersService;

    @Override
    public UserAnswer submitAnswer(Long userId, AnswerSubmitRequest request) {
        Question question = questionService.getByIdCached(request.getQuestionId());
        if (question == null) {
            throw new BusinessException(ErrorCode.NOT_FOUND, "题目不存在");
        }
        boolean correct = isCorrect(question.getAnswer(), request.getUserAnswer(), question.getType());
        UserAnswer answer = new UserAnswer();
        answer.setUserId(userId);
        answer.setQuestionId(question.getId());
        answer.setUserAnswer(request.getUserAnswer());
        answer.setCorrect(correct ? 1 : 0);
        answer.setTimeSpent(request.getTimeSpent() == null ? 0 : request.getTimeSpent());
        answer.setAnsweredAt(LocalDateTime.now());
        this.save(answer);
        userProgressService.updateProgress(userId, question.getCategoryId(), correct);
        wrongAnswersService.syncWrongAnswer(userId, question, request.getUserAnswer(), correct);
        return answer;
    }

    @Override
    public PageResponse<AnswerHistoryItem> history(Long userId, long page, long size) {
        Page<UserAnswer> answerPage = this.page(new Page<>(page, size),
                new LambdaQueryWrapper<UserAnswer>()
                        .eq(UserAnswer::getUserId, userId)
                        .orderByDesc(UserAnswer::getAnsweredAt));
        List<Long> questionIds = answerPage.getRecords().stream().map(UserAnswer::getQuestionId).toList();
        Map<Long, Question> questionMap = questionIds.isEmpty()
                ? Collections.emptyMap()
                : questionService.listByIds(questionIds).stream().collect(Collectors.toMap(Question::getId, q -> q));

        List<AnswerHistoryItem> items = answerPage.getRecords().stream()
                .map(record -> {
                    Question q = questionMap.get(record.getQuestionId());
                    return new AnswerHistoryItem(
                            record.getId(),
                            record.getQuestionId(),
                            q != null ? q.getTitle() : "",
                            record.getUserAnswer(),
                            q != null ? q.getAnswer() : "",
                            record.getCorrect() != null && record.getCorrect() == 1,
                            record.getAnsweredAt()
                    );
                })
                .toList();

        return new PageResponse<>(answerPage.getCurrent(), answerPage.getSize(), answerPage.getTotal(), items);
    }

    private boolean isCorrect(String standardAnswer, String userAnswer, String type) {
        if (StringUtils.isBlank(standardAnswer) || StringUtils.isBlank(userAnswer)) {
            return false;
        }
        if ("multiple_choice".equalsIgnoreCase(type)) {
            Set<String> standardSet = normalizeOptions(standardAnswer);
            Set<String> userSet = normalizeOptions(userAnswer);
            return standardSet.equals(userSet);
        }
        String cleanedStandard = standardAnswer.trim().replaceAll("\\s+", "").toLowerCase();
        String cleanedUser = userAnswer.trim().replaceAll("\\s+", "").toLowerCase();
        return cleanedStandard.equals(cleanedUser);
    }

    private Set<String> normalizeOptions(String value) {
        String[] parts = value.split("[,;\\s]+");
        Set<String> normalized = new HashSet<>();
        for (String part : parts) {
            if (StringUtils.isNotBlank(part)) {
                normalized.add(part.trim().toUpperCase());
            }
        }
        return normalized;
    }
}
