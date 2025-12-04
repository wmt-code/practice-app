package com.tb.practiceapp.model.dto.question;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class QuestionUpdateRequest {
    @NotNull(message = "题目ID不能为空")
    private Long id;

    @NotBlank(message = "题目标题不能为空")
    private String title;

    @NotBlank(message = "题目类型不能为空")
    private String type;

    @NotBlank(message = "正确答案不能为空")
    private String answer;

    /**
     * 选项 JSON 字符串
     */
    private String options;

    /**
     * 分值（可选）
     */
    private Integer score;

    /**
     * 建议作答时长（秒，可选）
     */
    private Integer duration;

    /**
     * 题目解析（可选）
     */
    private String explanation;

    @NotNull(message = "分类不能为空")
    private Long categoryId;

    @NotBlank(message = "难度不能为空")
    private String difficulty;
}
