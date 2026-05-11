package com.nextindie.api.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nextindie.api.config.properties.IgdbApiProperties;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Instant;

@Service
public class IgdbApiService {

    private final HttpClient httpClient = HttpClient.newHttpClient();
    private final ObjectMapper objectMapper;
    private final String baseUrl;
    private final String tokenUrl;
    private final String clientId;
    private final String clientSecret;

    private volatile String accessToken;
    private volatile Instant tokenExpiresAt;

    public IgdbApiService(ObjectMapper objectMapper,
                          IgdbApiProperties igdbApiProperties) {
        this.objectMapper = objectMapper;
        this.baseUrl = igdbApiProperties.baseUrl();
        this.tokenUrl = igdbApiProperties.tokenUrl();
        this.clientId = igdbApiProperties.clientId();
        this.clientSecret = igdbApiProperties.clientSecret();
    }

    public JsonNode postQuery(String endpoint, String body) {
        String token = getAccessToken();
        String url = baseUrl + "/" + endpoint;

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .header("Client-ID", clientId)
                .header("Authorization", "Bearer " + token)
                .header("Accept", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(body))
                .build();

        try {
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                throw new RuntimeException("Error IGDB " + response.statusCode() + ": " + response.body());
            }
            return objectMapper.readTree(response.body());
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Consulta IGDB interrumpida", e);
        } catch (IOException e) {
            throw new RuntimeException("No se pudo consultar IGDB", e);
        }
    }

    private synchronized String getAccessToken() {
        if (accessToken != null && tokenExpiresAt != null && tokenExpiresAt.isAfter(Instant.now().plusSeconds(60))) {
            return accessToken;
        }
        return refreshToken();
    }

    private String refreshToken() {
        String url = tokenUrl
                + "?client_id=" + encode(clientId)
                + "&client_secret=" + encode(clientSecret)
                + "&grant_type=client_credentials";

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .POST(HttpRequest.BodyPublishers.noBody())
                .build();

        try {
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                throw new RuntimeException("Error token IGDB " + response.statusCode() + ": " + response.body());
            }
            JsonNode payload = objectMapper.readTree(response.body());
            String token = payload.path("access_token").asText(null);
            long expiresIn = payload.path("expires_in").asLong(0);
            if (token == null || token.isBlank()) {
                throw new RuntimeException("No se recibio access_token de IGDB");
            }
            accessToken = token;
            tokenExpiresAt = Instant.now().plusSeconds(expiresIn);
            return accessToken;
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Solicitud de token IGDB interrumpida", e);
        } catch (IOException e) {
            throw new RuntimeException("No se pudo obtener token IGDB", e);
        }
    }

    private String encode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }
}
