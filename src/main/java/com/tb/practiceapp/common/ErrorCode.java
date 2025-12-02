package com.tb.practiceapp.common;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum ErrorCode {
    BAD_REQUEST(400, "Bad request"),
    UNAUTHORIZED(401, "Unauthorized"),
    FORBIDDEN(403, "Forbidden"),
    NOT_FOUND(404, "Not found"),
    CONFLICT(409, "Conflict"),
    VALIDATION_ERROR(422, "Validation error"),
    SERVER_ERROR(500, "Internal server error");

    private final int code;
    private final String message;
}
