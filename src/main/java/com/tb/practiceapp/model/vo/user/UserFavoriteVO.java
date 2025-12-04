package com.tb.practiceapp.model.vo.user;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class UserFavoriteVO {
    private Long id;
    private Long questionId;
    private String questionTitle;
    private String difficulty;
    private Long categoryId;
    private String categoryName;
    private LocalDateTime createdAt;
}
