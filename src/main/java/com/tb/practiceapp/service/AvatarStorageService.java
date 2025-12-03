package com.tb.practiceapp.service;

import com.tb.practiceapp.common.BusinessException;
import com.tb.practiceapp.common.ErrorCode;
import com.tb.practiceapp.config.StorageProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Instant;
import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AvatarStorageService {

    private static final long MAX_SIZE_BYTES = 5 * 1024 * 1024;

    private final StorageProperties storageProperties;

    public String storeAvatar(Long userId, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "头像文件不能为空");
        }
        if (file.getSize() > MAX_SIZE_BYTES) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "头像文件过大，限制5MB");
        }
        String ext = resolveExtension(file.getOriginalFilename());
        String filename = String.format("avatar_%d_%d_%s.%s", userId, Instant.now().toEpochMilli(), UUID.randomUUID().toString().substring(0, 8), ext);
        Path dir = Paths.get(storageProperties.getAvatarPath()).toAbsolutePath().normalize();
        try {
            Files.createDirectories(dir);
            Path target = dir.resolve(filename);
            file.transferTo(target);
            return "/files/avatars/" + filename;
        } catch (IOException | IllegalStateException e) {
            log.error(e.getMessage());
            throw new BusinessException(ErrorCode.BAD_REQUEST, "头像保存失败");
        }
    }

    private String resolveExtension(String filename) {
        if (StringUtils.isBlank(filename) || !filename.contains(".")) {
            return "png";
        }
        String ext = filename.substring(filename.lastIndexOf('.') + 1).toLowerCase(Locale.ROOT);
        if (ext.length() > 6) {
            return "png";
        }
        return ext;
    }
}
