package com.tb.practiceapp.model.dto.category;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CategoryRequest {
    @NotBlank(message = "分类名称不能为空")
    @Size(max = 100, message = "分类名称过长")
    private String name;

    private String description;

    private Long parentId;

    private Integer sort;

    /**
     * 1 启用, 0 停用
     */
    private Integer status;

    /**
     * 可选的前端标签文案
     */
    private String badgeText;
}
