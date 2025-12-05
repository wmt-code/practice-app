package com.tb.practiceapp.model.vo.answer;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AnswerHistoryVO {
    private Long questionId;
    private Long categoryId;
    private String questionTitle;
    private Boolean correct;
    private String userAnswer;
    private Integer score;
    private Integer timeSpent;
    private String difficulty;
    private LocalDateTime answeredAt;
}
