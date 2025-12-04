package com.tb.practiceapp.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.tb.practiceapp.mapper.UserFavoriteMapper;
import com.tb.practiceapp.model.entity.UserFavorite;
import com.tb.practiceapp.model.vo.user.UserFavoriteVO;
import com.tb.practiceapp.service.IUserFavoriteService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class UserFavoriteServiceImpl extends ServiceImpl<UserFavoriteMapper, UserFavorite> implements IUserFavoriteService {

    @Override
    public void addFavorite(Long userId, Long questionId) {
        LambdaQueryWrapper<UserFavorite> wrapper = new LambdaQueryWrapper<UserFavorite>()
                .eq(UserFavorite::getUserId, userId)
                .eq(UserFavorite::getQuestionId, questionId);
        UserFavorite exists = this.getOne(wrapper);
        if (exists != null) {
            return;
        }
        UserFavorite favorite = new UserFavorite();
        favorite.setUserId(userId);
        favorite.setQuestionId(questionId);
        favorite.setCreatedAt(LocalDateTime.now());
        this.save(favorite);
    }

    @Override
    public void removeFavorite(Long userId, Long questionId) {
        this.remove(new LambdaQueryWrapper<UserFavorite>()
                .eq(UserFavorite::getUserId, userId)
                .eq(UserFavorite::getQuestionId, questionId));
    }

    @Override
    public Page<UserFavoriteVO> pageFavorites(Long userId, long page, long size) {
        Page<UserFavoriteVO> p = new Page<>(page, size);
        return this.baseMapper.pageByUser(p, userId);
    }
}
