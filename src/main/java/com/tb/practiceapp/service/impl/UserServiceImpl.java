package com.tb.practiceapp.service.impl;

import org.py.mymodule.submodule.entity.User;
import org.py.mymodule.submodule.mapper.UserMapper;
import org.py.mymodule.submodule.service.IUserService;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
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
