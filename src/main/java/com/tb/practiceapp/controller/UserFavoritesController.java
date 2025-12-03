package com.tb.practiceapp.controller;


import com.tb.practiceapp.common.LoginRequired;
import org.springframework.web.bind.annotation.RequestMapping;

import org.springframework.web.bind.annotation.RestController;

/**
 * <p>
 *  前端控制器
 * </p>
 *
 * @author wmt
 * @since 2025-12-02
 */
@RestController
@RequestMapping("/user-favorites")
@LoginRequired
public class UserFavoritesController {

}
