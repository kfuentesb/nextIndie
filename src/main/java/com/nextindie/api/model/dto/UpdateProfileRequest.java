package com.nextindie.api.model.dto;

import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class UpdateProfileRequest {

    @Size(max = 500)
    private String bio;

    @Size(max = 100)
    private String location;

    @Size(max = 255)
    private String website;

    @Size(max = 50)
    private String twitterHandle;

    @Size(max = 50)
    private String discordUsername;

    @Size(max = 50)
    private String steamUsername;

    private Integer favoriteGenreId;

    private Boolean isPublic;
    private Boolean showEmail;
    private Boolean showActivity;

}