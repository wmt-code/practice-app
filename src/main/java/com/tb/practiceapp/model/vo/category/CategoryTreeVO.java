package com.tb.practiceapp.model.vo.category;

import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class CategoryTreeVO {
    private Long id;
    private String name;
    private Long parentId;
    private List<CategoryTreeVO> children = new ArrayList<>();
    private Integer questionCount;
    private Integer finishedCount;
    private String badgeText;
}
