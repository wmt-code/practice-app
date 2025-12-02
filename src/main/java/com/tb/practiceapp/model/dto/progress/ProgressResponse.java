package com.tb.practiceapp.model.dto.progress;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ProgressResponse {
    private Long categoryId;
    private String categoryName;
    private int completedQuestions;
    private int totalQuestions;
    private double accuracy;
    private int correctCount;
}
