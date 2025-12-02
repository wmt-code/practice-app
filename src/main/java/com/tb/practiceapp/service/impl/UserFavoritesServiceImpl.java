package com.tb.practiceapp.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.tb.practiceapp.mapper.UserFavoritesMapper;
import com.tb.practiceapp.model.entity.UserFavorites;
import com.tb.practiceapp.service.IUserFavoritesService;
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
public class UserFavoritesServiceImpl extends ServiceImpl<UserFavoritesMapper, UserFavorites> implements IUserFavoritesService {

}
