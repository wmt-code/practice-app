package com.tb.practiceapp.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import com.tb.practiceapp.model.entity.UserFavorite;
import com.tb.practiceapp.model.vo.user.UserFavoriteVO;

public interface IUserFavoriteService extends IService<UserFavorite> {

    void addFavorite(Long userId, Long questionId);

    void removeFavorite(Long userId, Long questionId);

    Page<UserFavoriteVO> pageFavorites(Long userId, long page, long size);
}
