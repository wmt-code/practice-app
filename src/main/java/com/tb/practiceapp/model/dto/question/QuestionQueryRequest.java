package com.tb.practiceapp.model.dto.question;

import lombok.Data;

@Data
public class QuestionQueryRequest {
    private Long categoryId;
    private String difficulty;
    private String keyword;
    private long page = 1;
    private long size = 10;
}
