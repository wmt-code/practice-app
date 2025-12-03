package com.tb.practiceapp.common;

public final class AuthUtils {

    private AuthUtils() {
    }

    public static Long currentUserId() {
        AuthUser authUser = AuthContext.get();
        if (authUser == null || authUser.getUserId() == null) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED, "未登录");
        }
        return authUser.getUserId();
    }

    public static AuthUser currentUser() {
        AuthUser authUser = AuthContext.get();
        if (authUser == null) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED, "未登录");
        }
        return authUser;
    }
}
