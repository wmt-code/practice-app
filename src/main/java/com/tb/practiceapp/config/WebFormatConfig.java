package com.tb.practiceapp.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.format.FormatterRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebFormatConfig implements WebMvcConfigurer {

    @Override
    public void addFormatters(FormatterRegistry registry) {
        registry.addConverter(new SafeStringToLongConverter());
        registry.addConverter(new SafeStringToIntegerConverter());
    }

    /**
     * 将 "", "null", "undefined" 视为 null，避免参数绑定时报类型转换异常。
     */
    static class SafeStringToLongConverter implements Converter<String, Long> {
        @Override
        public Long convert(String source) {
            if (source == null) {
                return null;
            }
            String trimmed = source.trim();
            if (trimmed.isEmpty()
                    || "null".equalsIgnoreCase(trimmed)
                    || "undefined".equalsIgnoreCase(trimmed)) {
                return null;
            }
            return Long.valueOf(trimmed);
        }
    }

    /**
     * 处理 Integer，同样忽略空值/"null"/"undefined"。
     */
    static class SafeStringToIntegerConverter implements Converter<String, Integer> {
        @Override
        public Integer convert(String source) {
            if (source == null) {
                return null;
            }
            String trimmed = source.trim();
            if (trimmed.isEmpty()
                    || "null".equalsIgnoreCase(trimmed)
                    || "undefined".equalsIgnoreCase(trimmed)) {
                return null;
            }
            return Integer.valueOf(trimmed);
        }
    }
}
