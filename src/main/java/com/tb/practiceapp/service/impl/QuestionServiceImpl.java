package com.tb.practiceapp.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.tb.practiceapp.mapper.QuestionMapper;
import com.tb.practiceapp.model.entity.Question;
import com.tb.practiceapp.service.IQuestionService;
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
public class QuestionServiceImpl extends ServiceImpl<QuestionMapper, Question> implements IQuestionService {

}
