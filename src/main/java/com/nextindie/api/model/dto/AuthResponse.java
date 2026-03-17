package com.nextindie.api.model.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AuthResponse {
    private String token;
    private String username;
    private String email;

    public AuthResponse(String token, String username, String email) {
        this.token = token;
        this.username = username;
        this.email = email;
    }
}