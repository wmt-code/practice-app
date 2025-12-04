package com.tb.practiceapp.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.tb.practiceapp.common.BusinessException;
import com.tb.practiceapp.common.ErrorCode;
import com.tb.practiceapp.mapper.CategoryMapper;
import com.tb.practiceapp.model.dto.category.CategoryQuestionCount;
import com.tb.practiceapp.model.dto.category.CategoryRequest;
import com.tb.practiceapp.model.entity.Category;
import com.tb.practiceapp.model.vo.category.CategoryTreeVO;
import com.tb.practiceapp.service.ICategoryService;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class CategoryServiceImpl extends ServiceImpl<CategoryMapper, Category> implements ICategoryService {

    @Override
    public Category createCategory(CategoryRequest request) {
        Category category = new Category();
        category.setName(request.getName());
        category.setDescription(request.getDescription());
        category.setParentId(request.getParentId() == null ? 0L : request.getParentId());
        category.setSort(request.getSort());
        category.setStatus(request.getStatus() == null ? 1 : request.getStatus());
        category.setBadgeText(request.getBadgeText());
        category.setDeleted(false);
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
        if (request.getParentId() != null) {
            category.setParentId(request.getParentId());
        }
        if (request.getSort() != null) {
            category.setSort(request.getSort());
        }
        if (request.getStatus() != null) {
            category.setStatus(request.getStatus());
        }
        if (request.getBadgeText() != null) {
            category.setBadgeText(request.getBadgeText());
        }
        this.updateById(category);
        return category;
    }

    @Override
    public void deleteCategory(Long id) {
        if (!this.removeById(id)) {
            throw new BusinessException(ErrorCode.NOT_FOUND, "分类不存在");
        }
    }

    @Override
    public List<CategoryTreeVO> getCategoryTree() {
        // 只取未删除且启用的分类，如果字段不存在则全部返回
        List<Category> categories = this.list().stream()
                .sorted(Comparator
                        .comparing(Category::getSort, Comparator.nullsLast(Integer::compareTo))
                        .thenComparing(Category::getId))
                .toList();
        Map<Long, CategoryTreeVO> voMap = new LinkedHashMap<>();
        for (Category category : categories) {
            if (Boolean.TRUE.equals(category.getDeleted())) {
                continue;
            }
            if (category.getStatus() != null && !Objects.equals(category.getStatus(), 1)) {
                continue;
            }
            CategoryTreeVO vo = new CategoryTreeVO();
            vo.setId(category.getId());
            vo.setName(category.getName());
            vo.setParentId(category.getParentId());
            vo.setBadgeText(category.getBadgeText());
            vo.setFinishedCount(0);
            vo.setQuestionCount(0);
            voMap.put(category.getId(), vo);
        }

        Map<Long, Integer> directCount = this.baseMapper.selectQuestionCounts().stream()
                .filter(item -> item.getCategoryId() != null)
                .collect(Collectors.toMap(CategoryQuestionCount::getCategoryId,
                        item -> item.getQuestionCount() == null ? 0 : item.getQuestionCount().intValue()));
        voMap.values().forEach(vo -> vo.setQuestionCount(directCount.getOrDefault(vo.getId(), 0)));

        List<CategoryTreeVO> roots = new ArrayList<>();
        for (CategoryTreeVO vo : voMap.values()) {
            Long parentId = vo.getParentId();
            if (parentId == null || parentId == 0) {
                roots.add(vo);
            } else {
                CategoryTreeVO parent = voMap.get(parentId);
                if (parent != null) {
                    parent.getChildren().add(vo);
                } else {
                    roots.add(vo);
                }
            }
        }

        roots.forEach(this::accumulateQuestionCount);
        return roots;
    }

    private int accumulateQuestionCount(CategoryTreeVO node) {
        int total = node.getQuestionCount();
        for (CategoryTreeVO child : node.getChildren()) {
            total += accumulateQuestionCount(child);
        }
        node.setQuestionCount(total);
        return total;
    }
}
