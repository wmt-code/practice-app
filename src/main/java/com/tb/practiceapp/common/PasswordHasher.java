package com.tb.practiceapp.common;

import org.apache.commons.lang3.StringUtils;
import org.mindrot.jbcrypt.BCrypt;
import org.springframework.stereotype.Component;

@Component
public class PasswordHasher {

    public String hash(String rawPassword) {
        if (StringUtils.isBlank(rawPassword)) {
            return null;
        }
        return BCrypt.hashpw(rawPassword, BCrypt.gensalt());
    }

    public boolean matches(String rawPassword, String hashedPassword) {
        if (StringUtils.isAnyBlank(rawPassword, hashedPassword)) {
            return false;
        }
        return BCrypt.checkpw(rawPassword, hashedPassword);
    }
}
