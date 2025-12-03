package com.tb.practiceapp.common;

import com.tb.practiceapp.model.entity.User;
import com.tb.practiceapp.security.JwtTokenProvider;
import com.tb.practiceapp.service.IUserService;
import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.ArrayUtils;
import org.apache.commons.lang3.StringUtils;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestAttributes;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import jakarta.servlet.http.HttpServletRequest;

@Aspect
@Component
@RequiredArgsConstructor
public class LoginAspect {

    private final JwtTokenProvider jwtTokenProvider;
    private final IUserService userService;

    @Around("@within(com.tb.practiceapp.common.LoginRequired) || @annotation(com.tb.practiceapp.common.LoginRequired)")
    public Object checkLogin(ProceedingJoinPoint pjp) throws Throwable {
        LoginRequired loginRequired = resolveAnnotation(pjp);
        HttpServletRequest request = currentRequest();
        String header = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (StringUtils.isBlank(header) || !header.startsWith("Bearer ")) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED, "未登录");
        }
        String token = header.substring(7);
        Claims claims;
        try {
            claims = jwtTokenProvider.parse(token);
        } catch (Exception ex) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED, "登录信息无效");
        }
        Long userId;
        try {
            userId = Long.valueOf(claims.getSubject());
        } catch (Exception ex) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED, "登录信息无效");
        }
        String username = claims.get("username", String.class);
        String role = StringUtils.defaultIfBlank(claims.get("role", String.class), "USER");

        User user = userService.getByIdCached(userId);
        if (user == null || user.getStatus() == null || user.getStatus() != 1) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED, "用户不存在或已被禁用");
        }

        String[] requiredRoles = loginRequired != null ? loginRequired.roles() : ArrayUtils.EMPTY_STRING_ARRAY;
        if (ArrayUtils.isNotEmpty(requiredRoles)) {
            boolean matched = false;
            for (String allowed : requiredRoles) {
                if (StringUtils.equalsIgnoreCase(allowed, role)) {
                    matched = true;
                    break;
                }
            }
            if (!matched) {
                throw new BusinessException(ErrorCode.FORBIDDEN, "无访问权限");
            }
        }

        AuthContext.set(new AuthUser(userId, username, role));
        try {
            return pjp.proceed();
        } finally {
            AuthContext.clear();
        }
    }

    private HttpServletRequest currentRequest() {
        RequestAttributes attrs = RequestContextHolder.getRequestAttributes();
        if (attrs instanceof ServletRequestAttributes servletRequestAttributes) {
            return servletRequestAttributes.getRequest();
        }
        throw new BusinessException(ErrorCode.UNAUTHORIZED, "未登录");
    }

    private LoginRequired resolveAnnotation(ProceedingJoinPoint pjp) {
        MethodSignature signature = (MethodSignature) pjp.getSignature();
        LoginRequired annotation = signature.getMethod().getAnnotation(LoginRequired.class);
        if (annotation == null) {
            annotation = (LoginRequired) pjp.getTarget().getClass().getAnnotation(LoginRequired.class);
        }
        return annotation;
    }
}
