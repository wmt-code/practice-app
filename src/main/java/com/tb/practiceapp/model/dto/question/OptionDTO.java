package com.tb.practiceapp.model.dto.question;

import lombok.Data;

@Data
public class OptionDTO {
    /**
     * 展示内容
     */
    private String label;
    /**
     * 选项值，如 A/B
     */
    private String value;
    /**
     * 是否正确（部分场景可不返回）
     */
    private Boolean correct;
}
