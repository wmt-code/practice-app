package com.tb.practiceapp.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.StringUtils;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Paths;

@Configuration
@RequiredArgsConstructor
public class WebMvcConfig implements WebMvcConfigurer {

    private final StorageProperties storageProperties;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String avatarPath = storageProperties.getAvatarPath();
        if (StringUtils.hasText(avatarPath)) {
            String location = Paths.get(avatarPath).toAbsolutePath().normalize().toUri().toString();
            registry.addResourceHandler("/files/avatars/**")
                    .addResourceLocations(location.endsWith("/") ? location : location + "/");
        }
    }
}

