package com.tb.practiceapp.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.tb.practiceapp.common.ApiResponse;
import com.tb.practiceapp.common.PageResponse;
import com.tb.practiceapp.model.dto.question.QuestionCreateRequest;
import com.tb.practiceapp.model.dto.question.QuestionQueryRequest;
import com.tb.practiceapp.model.dto.question.QuestionUpdateRequest;
import com.tb.practiceapp.model.entity.Question;
import com.tb.practiceapp.service.IQuestionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/questions")
@RequiredArgsConstructor
public class QuestionController {

    private final IQuestionService questionService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Question> create(@Valid @RequestBody QuestionCreateRequest request) {
        return ApiResponse.ok(questionService.createQuestion(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Question> update(@PathVariable Long id, @Valid @RequestBody QuestionUpdateRequest request) {
        request.setId(id);
        return ApiResponse.ok(questionService.updateQuestion(request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        questionService.deleteQuestion(id);
        return ApiResponse.ok();
    }

    @GetMapping("/{id}")
    public ApiResponse<Question> detail(@PathVariable Long id) {
        return ApiResponse.ok(questionService.getByIdCached(id));
    }

    @GetMapping
    public ApiResponse<PageResponse<Question>> query(@RequestParam(required = false) Long categoryId,
                                                     @RequestParam(required = false) String difficulty,
                                                     @RequestParam(required = false) String keyword,
                                                     @RequestParam(defaultValue = "1") long page,
                                                     @RequestParam(defaultValue = "10") long size) {
        QuestionQueryRequest request = new QuestionQueryRequest();
        request.setCategoryId(categoryId);
        request.setDifficulty(difficulty);
        request.setKeyword(keyword);
        request.setPage(page);
        request.setSize(size);
        Page<Question> pageResult = questionService.query(request);
        PageResponse<Question> response = new PageResponse<>(pageResult.getCurrent(), pageResult.getSize(), pageResult.getTotal(), pageResult.getRecords());
        return ApiResponse.ok(response);
    }
}
