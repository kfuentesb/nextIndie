package com.nextindie.api.dto;

import com.nextindie.api.model.enums.UserType;

public record AdminUserResponse(
        Long id,
        String username,
        String email,
        UserType role
) {
}
