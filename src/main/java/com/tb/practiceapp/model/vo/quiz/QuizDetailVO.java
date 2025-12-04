package com.tb.practiceapp.model.vo.quiz;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class QuizDetailVO {
    private Long id;
    private String title;
    private String description;
    private String status;
    private Long categoryId;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Integer timeLimit;
    private Integer totalScore;
    private Integer questionCount;
}
