package com.tb.practiceapp.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Getter
@Setter
@ConfigurationProperties(prefix = "storage")
public class StorageProperties {
    /**
     * 本地头像存储目录，支持相对路径（相对项目根目录）或绝对路径。
     */
    private String avatarPath = "./uploads/avatars";

    /**
     * 题目相关资源（如选项图片）存储目录。
     */
    private String questionPath = "./uploads/questions";
}
