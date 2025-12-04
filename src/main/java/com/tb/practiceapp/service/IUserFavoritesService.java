package com.tb.practiceapp.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.tb.practiceapp.model.entity.UserFavorites;
import com.tb.practiceapp.model.vo.user.UserFavoriteVO;

/**
 * <p>
 *  服务类
 * </p>
 *
 * @author wmt
 * @since 2025-12-02
 */
public interface IUserFavoritesService extends IService<UserFavorites> {

    void addFavorite(Long userId, Long questionId);

    void removeFavorite(Long userId, Long questionId);

    Page<UserFavoriteVO> pageFavorites(Long userId, long page, long size);
}
