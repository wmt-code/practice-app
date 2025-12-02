package com.tb.practiceapp.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.tb.practiceapp.common.BusinessException;
import com.tb.practiceapp.common.ErrorCode;
import com.tb.practiceapp.mapper.CategoryMapper;
import com.tb.practiceapp.model.dto.category.CategoryRequest;
import com.tb.practiceapp.model.entity.Category;
import com.tb.practiceapp.service.ICategoryService;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class CategoryServiceImpl extends ServiceImpl<CategoryMapper, Category> implements ICategoryService {

    @Override
    public Category createCategory(CategoryRequest request) {
        Category category = new Category();
        category.setName(request.getName());
        category.setDescription(request.getDescription());
        category.setCreatedAt(LocalDateTime.now());
        this.save(category);
        return category;
    }

    @Override
    public Category updateCategory(Long id, CategoryRequest request) {
        Category category = this.getById(id);
        if (category == null) {
            throw new BusinessException(ErrorCode.NOT_FOUND, "分类不存在");
        }
        if (StringUtils.isNotBlank(request.getName())) {
            category.setName(request.getName());
        }
        category.setDescription(request.getDescription());
        this.updateById(category);
        return category;
    }

    @Override
    public void deleteCategory(Long id) {
        if (!this.removeById(id)) {
            throw new BusinessException(ErrorCode.NOT_FOUND, "分类不存在");
        }
    }
}
