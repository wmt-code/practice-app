CREATE TABLE `user` (
                        `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
                        `username` VARCHAR(50) NOT NULL UNIQUE,              -- 用户名
                        `password` VARCHAR(100),                             -- 用户密码（如果使用其他方式登录时使用）
                        `nickname` VARCHAR(50),                              -- 用户昵称
                        `avatar` VARCHAR(1024),                              -- 用户头像
                        `email` VARCHAR(100),                                -- 用户邮箱
                        `status` TINYINT NOT NULL DEFAULT 1,                  -- 用户状态：1 正常，0 禁用
                        `openid` VARCHAR(100) UNIQUE NOT NULL,               -- 微信用户的openid（唯一标识）
                        `unionid` VARCHAR(100),                              -- 微信的unionid（如果有，多个公众号或小程序下共享）
                        `access_token` VARCHAR(512),                         -- 微信的access_token（用于API调用）
                        `refresh_token` VARCHAR(512),                        -- 微信的refresh_token
                        `expires_in` INT,                                    -- access_token的过期时间
                        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,    -- 创建时间
                        `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP -- 更新时间
);


CREATE TABLE `question` (
                            `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
                            `title` TEXT NOT NULL,                               -- 题目内容
                            `type` ENUM('single_choice', 'multiple_choice', 'true_false', 'fill_in_the_blank') NOT NULL,  -- 题目类型
                            `answer` TEXT NOT NULL,                              -- 正确答案
                            `options` TEXT,                                     -- 选项（如多选题，可以存储为JSON格式）
                            `category_id` BIGINT UNSIGNED,                       -- 所属类别ID（外键）
                            `difficulty` ENUM('easy', 'medium', 'hard') NOT NULL, -- 难度等级
                            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,    -- 创建时间
                            `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP -- 更新时间
);
CREATE TABLE `category` (
                            `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
                            `name` VARCHAR(100) NOT NULL,                       -- 分类名称
                            `description` TEXT,                                 -- 分类描述
                            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP    -- 创建时间
);
CREATE TABLE `user_answer` (
                               `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
                               `user_id` BIGINT UNSIGNED NOT NULL,                 -- 用户ID（外键）
                               `question_id` BIGINT UNSIGNED NOT NULL,             -- 题目ID（外键）
                               `user_answer` TEXT NOT NULL,                        -- 用户提交的答案
                               `correct` TINYINT NOT NULL DEFAULT 0,               -- 是否正确：0 错误，1 正确
                               `time_spent` INT NOT NULL,                           -- 用户答题所用时间（秒）
                               `answered_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP   -- 答题时间
);
CREATE TABLE `user_progress` (
                                 `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
                                 `user_id` BIGINT UNSIGNED NOT NULL,                 -- 用户ID（外键）
                                 `category_id` BIGINT UNSIGNED,                       -- 所属分类ID（外键）
                                 `completed_questions` INT NOT NULL DEFAULT 0,        -- 完成的题目数
                                 `total_questions` INT NOT NULL,                      -- 该分类下的总题目数
                                 `last_updated` TIMESTAMP DEFAULT CURRENT_TIMESTAMP   -- 最后更新时间
);
CREATE TABLE `user_favorites` (
                                  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
                                  `user_id` BIGINT UNSIGNED NOT NULL,                 -- 用户ID（外键）
                                  `question_id` BIGINT UNSIGNED NOT NULL,             -- 题目ID（外键）
                                  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP    -- 收藏时间
);

CREATE TABLE `user_wrong_answers` (
                                      `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
                                      `user_id` BIGINT UNSIGNED NOT NULL,                 -- 用户ID（外键）
                                      `question_id` BIGINT UNSIGNED NOT NULL,             -- 题目ID（外键）
                                      `user_answer` TEXT NOT NULL,                        -- 用户提交的错误答案
                                      `correct_answer` TEXT NOT NULL,                     -- 正确答案
                                      `attempted_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP  -- 错题本记录时间
);
CREATE TABLE `quiz` (
                        `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
                        `title` VARCHAR(100) NOT NULL,                      -- 测验/考试名称
                        `category_id` BIGINT UNSIGNED,                       -- 关联的分类ID
                        `start_time` TIMESTAMP,                              -- 开始时间
                        `end_time` TIMESTAMP,                                -- 结束时间
                        `total_score` INT NOT NULL,                          -- 总分
                        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP    -- 创建时间
);
CREATE TABLE `user_quiz_record` (
                                    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
                                    `user_id` BIGINT UNSIGNED NOT NULL,                 -- 用户ID（外键）
                                    `quiz_id` BIGINT UNSIGNED NOT NULL,                 -- 测验ID（外键）
                                    `score` INT NOT NULL,                               -- 得分
                                    `start_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,   -- 开始时间
                                    `end_time` TIMESTAMP,                               -- 结束时间
                                    `duration` INT NOT NULL,                            -- 考试时长（秒）
                                    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP    -- 创建时间
);

