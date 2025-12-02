package com.tb.practiceapp.security;

import com.tb.practiceapp.config.JwtProperties;
import com.tb.practiceapp.model.entity.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.time.Instant;
import java.util.Date;
import java.util.Map;

import static org.apache.commons.lang3.StringUtils.defaultIfBlank;

@Component
@RequiredArgsConstructor
public class JwtTokenProvider {

    private final JwtProperties properties;

    private Key signingKey() {
        return Keys.hmacShaKeyFor(properties.getSecret().getBytes(StandardCharsets.UTF_8));
    }

    public String generateAccessToken(User user) {
        Instant now = Instant.now();
        Instant expiry = now.plusSeconds(properties.getAccessTokenMinutes() * 60);
        String role = defaultIfBlank(user.getRole(), "USER");
        return Jwts.builder()
                .setSubject(user.getId().toString())
                .addClaims(Map.of(
                        "username", user.getUsername(),
                        "role", role
                ))
                .setIssuedAt(Date.from(now))
                .setExpiration(Date.from(expiry))
                .signWith(signingKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public String generateRefreshToken(User user) {
        Instant now = Instant.now();
        Instant expiry = now.plusSeconds(properties.getRefreshTokenMinutes() * 60);
        return Jwts.builder()
                .setSubject(user.getId().toString())
                .addClaims(Map.of(
                        "type", "refresh"
                ))
                .setIssuedAt(Date.from(now))
                .setExpiration(Date.from(expiry))
                .signWith(signingKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public Claims parse(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(signingKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}
