package com.tb.practiceapp.model.vo.quiz;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class MyQuizRecordVO {
    private Long quizId;
    private String quizTitle;
    private Integer score;
    private Integer duration;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
}
