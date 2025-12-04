package com.tb.practiceapp.model.vo.answer;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class WrongQuestionVO {
    private Long wrongId;
    private Long questionId;
    private String questionTitle;
    private String difficulty;
    private Long categoryId;
    private String categoryName;
    private String userAnswer;
    private String correctAnswer;
    private Integer wrongCount;
    private LocalDateTime lastAttemptedAt;
}
