package com.tb.practiceapp.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.tb.practiceapp.common.BusinessException;
import com.tb.practiceapp.common.ErrorCode;
import com.tb.practiceapp.mapper.UserMapper;
import com.tb.practiceapp.model.dto.user.PasswordUpdateRequest;
import com.tb.practiceapp.model.dto.user.UserProfileUpdateRequest;
import com.tb.practiceapp.model.entity.User;
import com.tb.practiceapp.service.IUserService;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.StringUtils;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * <p>
 * 服务实现类
 * </p>
 *
 * @author wmt
 * @since 2025-12-02
 */
@Service
@RequiredArgsConstructor
public class UserServiceImpl extends ServiceImpl<UserMapper, User> implements IUserService {

    private final PasswordEncoder passwordEncoder;

    @Override
    public User findByOpenId(String openId) {
        return this.getOne(new LambdaQueryWrapper<User>().eq(User::getOpenid, openId));
    }

    @Override
    public User findByUsername(String username) {
        return this.getOne(new LambdaQueryWrapper<User>().eq(User::getUsername, username));
    }

    @Override
    public User ensureUserFromWechat(String openId, String unionId, String accessToken, String refreshToken, Integer expiresIn, String nickname, String avatar) {
        User existing = findByOpenId(openId);
        if (existing != null) {
            existing.setUnionid(unionId);
            existing.setAccessToken(accessToken);
            existing.setRefreshToken(refreshToken);
            existing.setExpiresIn(expiresIn);
            if (StringUtils.isNotBlank(nickname)) {
                existing.setNickname(nickname);
            }
            if (StringUtils.isNotBlank(avatar)) {
                existing.setAvatar(avatar);
            }
            existing.setUpdatedAt(LocalDateTime.now());
            updateUser(existing);
            return existing;
        }
        User user = new User();
        user.setOpenid(openId);
        user.setUnionid(unionId);
        user.setAccessToken(accessToken);
        user.setRefreshToken(refreshToken);
        user.setExpiresIn(expiresIn);
        user.setNickname(StringUtils.defaultIfBlank(nickname, "学员"));
        user.setAvatar(avatar);
        String baseUsername = "wx_" + StringUtils.substring(openId, Math.max(openId.length() - 6, 0));
        String candidate = baseUsername;
        int suffix = 1;
        while (findByUsername(candidate) != null) {
            candidate = baseUsername + suffix;
            suffix++;
        }
        user.setUsername(candidate);
        user.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
        user.setStatus(1);
        user.setRole("USER");
        user.setCreatedAt(LocalDateTime.now());
        this.save(user);
        return user;
    }

    @Override
    @Cacheable(value = "users", key = "#userId")
    public User getByIdCached(Long userId) {
        return this.getById(userId);
    }

    @Override
    @CacheEvict(value = "users", key = "#userId")
    public void updateProfile(Long userId, UserProfileUpdateRequest request) {
        User user = this.getById(userId);
        if (user == null) {
            throw new BusinessException(ErrorCode.NOT_FOUND, "用户不存在");
        }
        if (StringUtils.isNotBlank(request.getNickname())) {
            user.setNickname(request.getNickname());
        }
        if (StringUtils.isNotBlank(request.getAvatar())) {
            user.setAvatar(request.getAvatar());
        }
        if (StringUtils.isNotBlank(request.getEmail())) {
            //添加邮箱格式校验
            String email = request.getEmail();
            String emailRegex = "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$";
            if (!email.matches(emailRegex)) {
                throw new BusinessException(ErrorCode.BAD_REQUEST, "邮箱格式不正确");
            }
            user.setEmail(request.getEmail());
        }
        user.setUpdatedAt(LocalDateTime.now());
        this.updateById(user);
    }

    @Override
    @CacheEvict(value = "users", key = "#userId")
    public void updatePassword(Long userId, PasswordUpdateRequest request) {
        User user = this.getById(userId);
        if (user == null) {
            throw new BusinessException(ErrorCode.NOT_FOUND, "用户不存在");
        }
        if (StringUtils.isBlank(user.getPassword()) || !passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "原密码不正确");
        }
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setUpdatedAt(LocalDateTime.now());
        this.updateById(user);
    }

    @CacheEvict(value = "users", key = "#user.id")
    public void updateUser(User user) {
        this.updateById(user);
    }
}
