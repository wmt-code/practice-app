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
@TableName("category")
public class Category implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;

    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    private String name;

    private String description;

    private Long parentId;

    private Integer sort;

    /**
     * 1 启用, 0 停用
     */
    private Integer status;

    /**
     * 逻辑删除标记，0/false 表示未删除
     */
    private Boolean deleted;

    /**
     * 前端展示的可选标记文本
     */
    private String badgeText;

    private LocalDateTime createdAt;


}
