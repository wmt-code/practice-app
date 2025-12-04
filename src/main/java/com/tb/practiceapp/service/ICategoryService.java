package com.tb.practiceapp.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.tb.practiceapp.model.dto.category.CategoryRequest;
import com.tb.practiceapp.model.entity.Category;
import com.tb.practiceapp.model.vo.category.CategoryTreeVO;

import java.util.List;

/**
 * <p>
 *  服务类
 * </p>
 *
 * @author wmt
 * @since 2025-12-02
 */
public interface ICategoryService extends IService<Category> {

    Category createCategory(CategoryRequest request);

    Category updateCategory(Long id, CategoryRequest request);

    void deleteCategory(Long id);

    /**
     * 获取分类树（含题量汇总）
     */
    List<CategoryTreeVO> getCategoryTree();
}
