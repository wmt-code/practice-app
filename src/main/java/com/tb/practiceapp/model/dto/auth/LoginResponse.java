package com.tb.practiceapp.model.dto.auth;

import com.tb.practiceapp.model.entity.User;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LoginResponse {
    private String accessToken;
    private String refreshToken;
    private User user;
}
