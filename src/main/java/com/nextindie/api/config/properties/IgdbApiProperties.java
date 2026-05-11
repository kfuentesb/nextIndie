package com.nextindie.api.config.properties;

import jakarta.validation.constraints.NotBlank;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

@Validated
@ConfigurationProperties(prefix = "igdb.api")
public record IgdbApiProperties(
        @NotBlank String baseUrl,
        @NotBlank String tokenUrl,
        @NotBlank String clientId,
        @NotBlank String clientSecret
) {
}
