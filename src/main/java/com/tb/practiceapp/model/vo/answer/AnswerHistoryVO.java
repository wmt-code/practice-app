package com.tb.practiceapp.model.vo.answer;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AnswerHistoryVO {
    private Long questionId;
    private String questionTitle;
    private Boolean correct;
    private Integer score;
    private Integer timeSpent;
    private String difficulty;
    private LocalDateTime answeredAt;
}
