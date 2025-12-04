package com.tb.practiceapp.model.vo.answer;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class AnswerResultVO {
    private Long questionId;
    private String questionTitle;
    private List<String> userAnswer;
    private List<String> correctAnswer;
    private Boolean correct;
    private Integer score;
    private Integer timeSpent;
    private String explanation;
    private String difficulty;
    private LocalDateTime answeredAt;
}
