package com.tb.practiceapp.model.dto.answer;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class AnswerSubmitDTO {
    @NotNull(message = "题目ID不能为空")
    private Long questionId;

    @NotEmpty(message = "答案不能为空")
    private List<String> userAnswerValues;

    @Min(value = 0, message = "耗时不能为负数")
    private Integer timeSpent;
}
