package com.tb.practiceapp.model.vo.question;

import com.tb.practiceapp.model.dto.question.OptionDTO;
import lombok.Data;

import java.util.List;

@Data
public class QuestionPracticeVO {
    private Long id;
    private String content;
    private String type;
    private List<OptionDTO> options;
    private Integer score;
    private Integer duration;
    private String explanation;
    private Long categoryId;
    private String difficulty;
}
