package com.tb.practiceapp.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.tb.practiceapp.model.dto.user.PasswordUpdateRequest;
import com.tb.practiceapp.model.dto.user.UserProfileUpdateRequest;
import com.tb.practiceapp.model.entity.User;

/**
 * <p>
 *  服务类
 * </p>
 *
 * @author wmt
 * @since 2025-12-02
 */
public interface IUserService extends IService<User> {

    User findByOpenId(String openId);

    User findByUsername(String username);

    User ensureUserFromWechat(String openId, String unionId, String sessionKey, Integer expiresIn, String nickname, String avatar);

    User getByIdCached(Long userId);

    void updateProfile(Long userId, UserProfileUpdateRequest request);

    void updatePassword(Long userId, PasswordUpdateRequest request);
}
