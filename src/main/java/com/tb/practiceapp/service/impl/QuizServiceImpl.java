package com.tb.practiceapp.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.tb.practiceapp.mapper.QuizMapper;
import com.tb.practiceapp.model.entity.Quiz;
import com.tb.practiceapp.service.IQuizService;
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
public class QuizServiceImpl extends ServiceImpl<QuizMapper, Quiz> implements IQuizService {

}
