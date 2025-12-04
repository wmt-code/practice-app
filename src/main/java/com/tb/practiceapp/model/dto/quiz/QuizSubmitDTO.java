package com.tb.practiceapp.model.dto.quiz;

import com.tb.practiceapp.model.dto.answer.AnswerSubmitDTO;
import lombok.Data;

import java.util.List;

@Data
public class QuizSubmitDTO {
    private List<AnswerSubmitDTO> answers;
    /**
     * 实际耗时（秒，可选）
     */
    private Integer duration;
}
