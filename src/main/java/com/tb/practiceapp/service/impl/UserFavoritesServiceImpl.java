package com.tb.practiceapp.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.tb.practiceapp.mapper.UserFavoritesMapper;
import com.tb.practiceapp.model.entity.UserFavorites;
import com.tb.practiceapp.model.vo.user.UserFavoriteVO;
import com.tb.practiceapp.service.IUserFavoritesService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

/**
 * <p>
 *  服务实现类
 * </p>
 *
 * @author wmt
 * @since 2025-12-02
 */
@Service
public class UserFavoritesServiceImpl extends ServiceImpl<UserFavoritesMapper, UserFavorites> implements IUserFavoritesService {

    @Override
    public void addFavorite(Long userId, Long questionId) {
        LambdaQueryWrapper<UserFavorites> wrapper = new LambdaQueryWrapper<UserFavorites>()
                .eq(UserFavorites::getUserId, userId)
                .eq(UserFavorites::getQuestionId, questionId);
        UserFavorites exists = this.getOne(wrapper);
        if (exists != null) {
            return;
        }
        UserFavorites favorite = new UserFavorites();
        favorite.setUserId(userId);
        favorite.setQuestionId(questionId);
        favorite.setCreatedAt(LocalDateTime.now());
        this.save(favorite);
    }

    @Override
    public void removeFavorite(Long userId, Long questionId) {
        this.remove(new LambdaQueryWrapper<UserFavorites>()
                .eq(UserFavorites::getUserId, userId)
                .eq(UserFavorites::getQuestionId, questionId));
    }

    @Override
    public Page<UserFavoriteVO> pageFavorites(Long userId, long page, long size) {
        Page<UserFavoriteVO> p = new Page<>(page, size);
        return this.baseMapper.pageByUser(p, userId);
    }
}
