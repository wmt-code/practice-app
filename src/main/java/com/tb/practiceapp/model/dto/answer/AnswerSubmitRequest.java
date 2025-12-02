package com.tb.practiceapp.model.dto.answer;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AnswerSubmitRequest {
    @NotNull(message = "题目ID不能为空")
    private Long questionId;

    @NotNull(message = "答案不能为空")
    private String userAnswer;

    @Min(value = 0, message = "耗时不能为负数")
    private Integer timeSpent;
}
