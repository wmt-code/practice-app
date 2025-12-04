package com.tb.practiceapp.model.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.experimental.Accessors;

import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * <p>
 * 
 * </p>
 *
 * @author wmt
 * @since 2025-12-02
 */
@Data
@EqualsAndHashCode(callSuper = false)
@Accessors(chain = true)
@TableName("quiz")
public class Quiz implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;

    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    private String title;

    private String description;

    /**
     * DRAFT / PUBLISHED / CLOSED
     */
    private String status;

    private Long categoryId;

    private LocalDateTime startTime;

    private LocalDateTime endTime;

    /**
     * 限时（秒）
     */
    private Integer timeLimit;

    /**
     * 题目 ID 列表，JSON 数组字符串
     */
    private String questionIds;

    private Integer totalScore;

    private LocalDateTime createdAt;


}
