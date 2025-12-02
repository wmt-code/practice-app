package com.tb.practiceapp.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Getter
@Setter
@ConfigurationProperties(prefix = "app.jwt")
public class JwtProperties {
    /**
     * HS256 secret key. Override via environment variable for production.
     */
    private String secret = "local-dev-secret-change-me-please-32bytes";
    /**
     * Access token validity in minutes.
     */
    private long accessTokenMinutes = 120;
    /**
     * Refresh token validity in minutes.
     */
    private long refreshTokenMinutes = 60 * 24 * 30;
}
