package com.tb.practiceapp.model.vo.quiz;

import lombok.Data;

@Data
public class QuizStatsVO {
    private Long quizId;
    private Long participants;
    private Double avgScore;
    private Integer maxScore;
    private Integer minScore;
}
