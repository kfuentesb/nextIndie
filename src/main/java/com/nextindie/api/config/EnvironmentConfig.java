package com.nextindie.api.config;

import com.nextindie.api.config.properties.CorsProperties;
import com.nextindie.api.config.properties.IgdbApiProperties;
import com.nextindie.api.config.properties.JwtProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties({
        CorsProperties.class,
        IgdbApiProperties.class,
        JwtProperties.class
})
public class EnvironmentConfig {
}
