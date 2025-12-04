package com.tb.practiceapp.model.vo.quiz;

import com.tb.practiceapp.model.vo.question.QuestionPracticeVO;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class QuizPaperVO {
    private Long id;
    private String title;
    private String description;
    private String status;
    private Long categoryId;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Integer timeLimit;
    private Integer totalScore;
    private List<QuestionPracticeVO> questions;
}
