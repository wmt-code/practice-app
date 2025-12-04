package com.tb.practiceapp.model.vo.quiz;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class QuizRankItemVO {
    private Long userId;
    private String nickname;
    private Integer score;
    private Integer duration;
    private LocalDateTime submitTime;
}
