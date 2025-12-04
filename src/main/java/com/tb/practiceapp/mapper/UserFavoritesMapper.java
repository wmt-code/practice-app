package com.tb.practiceapp.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.tb.practiceapp.model.entity.UserFavorites;
import com.tb.practiceapp.model.vo.user.UserFavoriteVO;
import org.apache.ibatis.annotations.Param;

/**
 * <p>
 *  Mapper 接口
 * </p>
 *
 * @author wmt
 * @since 2025-12-02
 */
public interface UserFavoritesMapper extends BaseMapper<UserFavorites> {

    Page<UserFavoriteVO> pageByUser(Page<UserFavoriteVO> page, @Param("userId") Long userId);
}
