package com.tb.practiceapp.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.tb.practiceapp.mapper.CategoryMapper;
import com.tb.practiceapp.model.entity.Category;
import com.tb.practiceapp.service.ICategoryService;
import org.springframework.stereotype.Service;

/**
 * <p>
 * 服务实现类
 * </p>
 *
 * @author wmt
 * @since 2025-12-02
 */
@Service
public class CategoryServiceImpl extends ServiceImpl<CategoryMapper, Category> implements ICategoryService {

}
