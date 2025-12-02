package com.tb.practiceapp.model.dto.answer;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class AnswerHistoryItem {
    private Long id;
    private Long questionId;
    private String questionTitle;
    private String userAnswer;
    private String correctAnswer;
    private boolean correct;
    private LocalDateTime answeredAt;
}
