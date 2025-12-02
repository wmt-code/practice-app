package com.tb.practiceapp.service.impl;

import org.py.mymodule.submodule.entity.Question;
import org.py.mymodule.submodule.mapper.QuestionMapper;
import org.py.mymodule.submodule.service.IQuestionService;
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
public class QuestionServiceImpl extends ServiceImpl<QuestionMapper, Question> implements IQuestionService {

}
