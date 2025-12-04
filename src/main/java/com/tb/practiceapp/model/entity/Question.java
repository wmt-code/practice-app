package com.tb.practiceapp.model.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.experimental.Accessors;

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
@TableName("question")
public class Question implements Serializable {

    private static final long serialVersionUID = 1L;

    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    private String title;

    private String type;

    /**
     * 选项 JSON 字符串，存储数组结构
     */
    @TableField("options")
    private String optionsJson;

    private String answer;

    /**
     * 分值
     */
    private Integer score;

    /**
     * 建议作答时长（秒）
     */
    private Integer duration;

    /**
     * 题目解析
     */
    private String explanation;

    private Long categoryId;

    private String difficulty;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;


}
