package com.tb.practiceapp.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.tb.practiceapp.mapper.UserProgressMapper;
import com.tb.practiceapp.model.dto.progress.ProgressResponse;
import com.tb.practiceapp.model.entity.Category;
import com.tb.practiceapp.model.entity.Question;
import com.tb.practiceapp.model.entity.UserProgress;
import com.tb.practiceapp.service.ICategoryService;
import com.tb.practiceapp.service.IQuestionService;
import com.tb.practiceapp.service.IUserProgressService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class UserProgressServiceImpl extends ServiceImpl<UserProgressMapper, UserProgress> implements IUserProgressService {

    private final IQuestionService questionService;
    private final ICategoryService categoryService;

    public UserProgressServiceImpl(IQuestionService questionService, ICategoryService categoryService) {
        this.questionService = questionService;
        this.categoryService = categoryService;
    }

    @Override
    public void updateProgress(Long userId, Long categoryId, boolean correct) {
        if (categoryId == null) {
            return;
        }
        int total = (int) questionService.count(new LambdaQueryWrapper<Question>().eq(Question::getCategoryId, categoryId));
        LambdaQueryWrapper<UserProgress> wrapper = new LambdaQueryWrapper<UserProgress>()
                .eq(UserProgress::getUserId, userId)
                .eq(UserProgress::getCategoryId, categoryId);
        UserProgress progress = this.getOne(wrapper);
        if (progress == null) {
            progress = new UserProgress();
            progress.setUserId(userId);
            progress.setCategoryId(categoryId);
            progress.setCompletedQuestions(1);
            progress.setCorrectCount(correct ? 1 : 0);
            progress.setTotalQuestions(total);
            progress.setLastUpdated(LocalDateTime.now());
            this.save(progress);
            return;
        }
        progress.setCompletedQuestions(progress.getCompletedQuestions() + 1);
        if (correct) {
            progress.setCorrectCount(progress.getCorrectCount() + 1);
        }
        progress.setTotalQuestions(total);
        progress.setLastUpdated(LocalDateTime.now());
        this.updateById(progress);
    }

    @Override
    public List<ProgressResponse> getProgress(Long userId) {
        List<Category> categories = categoryService.list();
        Map<Long, UserProgress> progressMap = this.list(new LambdaQueryWrapper<UserProgress>().eq(UserProgress::getUserId, userId))
                .stream()
                .collect(Collectors.toMap(UserProgress::getCategoryId, Function.identity()));

        List<ProgressResponse> responses = new ArrayList<>();
        for (Category category : categories) {
            UserProgress progress = progressMap.get(category.getId());
            int totalQuestions = (int) questionService.count(new LambdaQueryWrapper<Question>().eq(Question::getCategoryId, category.getId()));
            if (progress == null) {
                responses.add(new ProgressResponse(category.getId(), category.getName(), 0, totalQuestions, 0D, 0));
            } else {
                int completed = progress.getCompletedQuestions() == null ? 0 : progress.getCompletedQuestions();
                int correct = progress.getCorrectCount() == null ? 0 : progress.getCorrectCount();
                double accuracy = completed == 0 ? 0D : (double) correct / completed;
                responses.add(new ProgressResponse(category.getId(), category.getName(), completed, totalQuestions, accuracy, correct));
            }
        }
        return responses;
    }
}
