package com.tb.practiceapp.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.tb.practiceapp.model.dto.category.CategoryQuestionCount;
import com.tb.practiceapp.model.entity.Category;

import java.util.List;

/**
 * <p>
 *  Mapper 接口
 * </p>
 *
 * @author wmt
 * @since 2025-12-02
 */
public interface CategoryMapper extends BaseMapper<Category> {

    /**
     * 统计每个分类下的直接题量
     */
    List<CategoryQuestionCount> selectQuestionCounts();

}
