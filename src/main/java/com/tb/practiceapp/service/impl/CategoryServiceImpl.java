package com.tb.practiceapp.service.impl;

import org.py.mymodule.submodule.entity.Category;
import org.py.mymodule.submodule.mapper.CategoryMapper;
import org.py.mymodule.submodule.service.ICategoryService;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.springframework.stereotype.Service;

/**
 * <p>
 *  服务实现类
 * </p>
 *
 * @author wmt
 * @since 2025-12-02
 */
@Service
public class CategoryServiceImpl extends ServiceImpl<CategoryMapper, Category> implements ICategoryService {

}
