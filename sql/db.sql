CREATE TABLE `user` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `username` VARCHAR(50) NOT NULL UNIQUE,
    `password` VARCHAR(100),
    `nickname` VARCHAR(50),
    `avatar` VARCHAR(1024),
    `role` VARCHAR(20) NOT NULL DEFAULT 'USER',
    `email` VARCHAR(100),
    `status` TINYINT NOT NULL DEFAULT 1,
    `openid` VARCHAR(100) UNIQUE NOT NULL,
    `unionid` VARCHAR(100),
    `session_key` VARCHAR(255),
    `access_token` VARCHAR(512),
    `refresh_token` VARCHAR(512),
    `expires_in` INT,
    `created_at` TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE `question` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `title` TEXT NOT NULL,
    `type` ENUM('single_choice', 'multiple_choice', 'true_false', 'fill_in_the_blank') NOT NULL,
    `answer` TEXT NOT NULL,
    `options` TEXT,
    `score` INT NOT NULL DEFAULT 1 COMMENT '题目分值',
    `duration` INT NOT NULL DEFAULT 60 COMMENT '建议作答时长（秒）',
    `explanation` TEXT COMMENT '题目解析',
    `category_id` BIGINT UNSIGNED,
    `difficulty` ENUM('easy', 'medium', 'hard') NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE `category` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL,
    `description` TEXT,
    `parent_id` BIGINT UNSIGNED DEFAULT 0,
    `sort` INT DEFAULT 0,
    `status` TINYINT NOT NULL DEFAULT 1,
    `deleted` TINYINT NOT NULL DEFAULT 0,
    `badge_text` VARCHAR(50),
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE `user_answer` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `question_id` BIGINT UNSIGNED NOT NULL,
    `user_answer` TEXT NOT NULL,
    `correct` TINYINT NOT NULL DEFAULT 0,
    `time_spent` INT NOT NULL,
    `answered_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE `user_progress` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `category_id` BIGINT UNSIGNED,
    `completed_questions` INT NOT NULL DEFAULT 0,
    `correct_count` INT NOT NULL DEFAULT 0,
    `total_questions` INT NOT NULL,
    `last_updated` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE `user_favorites` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `question_id` BIGINT UNSIGNED NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE `user_wrong_answers` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `question_id` BIGINT UNSIGNED NOT NULL,
    `user_answer` TEXT NOT NULL,
    `correct_answer` TEXT NOT NULL,
    `attempted_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE `quiz` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `title` VARCHAR(100) NOT NULL,
    `category_id` BIGINT UNSIGNED,
    `start_time` TIMESTAMP,
    `end_time` TIMESTAMP,
    `total_score` INT NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE `user_quiz_record` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `quiz_id` BIGINT UNSIGNED NOT NULL,
    `score` INT NOT NULL,
    `start_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `end_time` TIMESTAMP,
    `duration` INT NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
