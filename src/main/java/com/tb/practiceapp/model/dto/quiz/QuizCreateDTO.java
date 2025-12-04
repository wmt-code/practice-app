package com.tb.practiceapp.model.dto.quiz;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class QuizCreateDTO {
    private Long id;
    private String title;
    private Long categoryId;
    private String description;
    private Integer totalScore;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Integer timeLimit;
    private List<Long> questionIds;
}
