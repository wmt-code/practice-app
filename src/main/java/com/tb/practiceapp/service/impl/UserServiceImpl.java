package com.tb.practiceapp.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.tb.practiceapp.mapper.UserMapper;
import com.tb.practiceapp.model.entity.User;
import com.tb.practiceapp.service.IUserService;
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
public class UserServiceImpl extends ServiceImpl<UserMapper, User> implements IUserService {

}
