package com.tb.practiceapp.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.experimental.Accessors;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * <p>
 * 
 * </p>
 *
 * @author wmt
 * @since 2025-12-02
 */
@Data
@EqualsAndHashCode(callSuper = false)
@Accessors(chain = true)
@TableName("user")
public class User implements Serializable {

    private static final long serialVersionUID = 1L;

    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    private String username;

    @JsonIgnore
    private String password;

    private String nickname;

    private String avatar;

    /**
     * Role values: ADMIN or USER.
     */
    private String role;

    private String email;

    private Integer status;

    private String openid;

    private String unionid;

    @JsonIgnore
    private String accessToken;

    @JsonIgnore
    private String refreshToken;

    private Integer expiresIn;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;


}
