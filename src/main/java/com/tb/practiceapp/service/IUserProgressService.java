package com.tb.practiceapp.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.tb.practiceapp.model.dto.progress.ProgressResponse;
import com.tb.practiceapp.model.entity.UserProgress;

import java.util.List;

/**
 * <p>
 *  服务类
 * </p>
 *
 * @author wmt
 * @since 2025-12-02
 */
public interface IUserProgressService extends IService<UserProgress> {

    void updateProgress(Long userId, Long categoryId, boolean correct);

    List<ProgressResponse> getProgress(Long userId);
}
