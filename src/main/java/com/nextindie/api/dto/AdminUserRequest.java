package com.nextindie.api.dto;

import com.nextindie.api.model.enums.UserType;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminUserRequest {
    private String username;
    private String email;
    private String password;
    private UserType role;
}
