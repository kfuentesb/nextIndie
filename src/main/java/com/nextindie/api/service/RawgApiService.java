package com.nextindie.api.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;

@Service
public class RawgApiService {

    private final HttpClient httpClient = HttpClient.newHttpClient();
    private final ObjectMapper objectMapper;
    private final String baseUrl;
    private final String apiKey;

    public RawgApiService(ObjectMapper objectMapper,
                          @Value("${rawg.api.base-url}") String baseUrl,
                          @Value("${rawg.api.key}") String apiKey) {
        this.objectMapper = objectMapper;
        this.baseUrl = baseUrl;
        this.apiKey = apiKey;
    }

    public JsonNode fetchGenres() {
        return get("/genres?page_size=40");
    }

    public JsonNode fetchPlatforms() {
        return get("/platforms?page_size=100");
    }

    public JsonNode fetchReleases(LocalDate startDate, LocalDate endDate, int pageSize) {
        String dates = startDate + "," + endDate;
        return get("/games?ordering=released&page_size=" + pageSize + "&dates=" + encode(dates));
    }

    public JsonNode fetchGameDetails(Long rawgGameId) {
        return get("/games/" + rawgGameId);
    }

    private JsonNode get(String pathAndQuery) {
        String separator = pathAndQuery.contains("?") ? "&" : "?";
        String url = baseUrl + pathAndQuery + separator + "key=" + encode(apiKey);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .GET()
                .build();

        try {
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                throw new RuntimeException("Error RAWG " + response.statusCode() + ": " + response.body());
            }
            return objectMapper.readTree(response.body());
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Consulta RAWG interrumpida", e);
        } catch (IOException e) {
            throw new RuntimeException("No se pudo consultar RAWG", e);
        }
    }

    private String encode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }
}
