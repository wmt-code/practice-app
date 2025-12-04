package com.tb.practiceapp.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.tb.practiceapp.model.entity.UserFavorite;
import com.tb.practiceapp.model.vo.user.UserFavoriteVO;
import org.apache.ibatis.annotations.Param;

public interface UserFavoriteMapper extends BaseMapper<UserFavorite> {

    Page<UserFavoriteVO> pageByUser(Page<UserFavoriteVO> page, @Param("userId") Long userId);
}
