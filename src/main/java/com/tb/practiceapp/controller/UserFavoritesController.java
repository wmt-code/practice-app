package com.tb.practiceapp.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.tb.practiceapp.common.ApiResponse;
import com.tb.practiceapp.common.AuthUtils;
import com.tb.practiceapp.common.LoginRequired;
import com.tb.practiceapp.common.PageResponse;
import com.tb.practiceapp.model.vo.user.UserFavoriteVO;
import com.tb.practiceapp.service.IUserFavoritesService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/user-favorites")
@LoginRequired
@RequiredArgsConstructor
public class UserFavoritesController {

    private final IUserFavoritesService favoriteService;

    @PostMapping("/{questionId}")
    public ApiResponse<Void> add(@PathVariable Long questionId) {
        favoriteService.addFavorite(AuthUtils.currentUserId(), questionId);
        return ApiResponse.ok();
    }

    @DeleteMapping("/{questionId}")
    public ApiResponse<Void> remove(@PathVariable Long questionId) {
        favoriteService.removeFavorite(AuthUtils.currentUserId(), questionId);
        return ApiResponse.ok();
    }

    @GetMapping
    public ApiResponse<PageResponse<UserFavoriteVO>> list(@RequestParam(defaultValue = "1") long page,
                                                          @RequestParam(defaultValue = "10") long size) {
        Page<UserFavoriteVO> res = favoriteService.pageFavorites(AuthUtils.currentUserId(), page, size);
        PageResponse<UserFavoriteVO> response = new PageResponse<>(res.getCurrent(), res.getSize(), res.getTotal(), res.getRecords());
        return ApiResponse.ok(response);
    }
}
