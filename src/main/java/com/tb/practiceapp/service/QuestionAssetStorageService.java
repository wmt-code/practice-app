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
public class QuestionAssetStorageService {

    private static final long MAX_SIZE_BYTES = 8 * 1024 * 1024;

    private final StorageProperties storageProperties;

    public String store(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "文件不能为空");
        }
        if (file.getSize() > MAX_SIZE_BYTES) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "文件过大，限制 8MB");
        }
        String ext = resolveExtension(file.getOriginalFilename());
        String filename = String.format("question_%d_%s.%s",
                Instant.now().toEpochMilli(),
                UUID.randomUUID().toString().substring(0, 8),
                ext);
        Path dir = Paths.get(storageProperties.getQuestionPath()).toAbsolutePath().normalize();
        try {
            Files.createDirectories(dir);
            Path target = dir.resolve(filename);
            file.transferTo(target);
            return "/files/questions/" + filename;
        } catch (IOException | IllegalStateException e) {
            log.error("store question asset failed", e);
            throw new BusinessException(ErrorCode.BAD_REQUEST, "文件保存失败");
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

