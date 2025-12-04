package com.tb.practiceapp.model.vo.quiz;

import lombok.Data;

@Data
public class QuizSubmitResultVO {
    private Long quizId;
    private Integer obtainedScore;
    private Integer totalScore;
    private Integer correctCount;
    private Integer wrongCount;
}
