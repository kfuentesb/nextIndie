package com.nextindie.api.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.nextindie.api.model.Game;
import com.nextindie.api.model.Genre;
import com.nextindie.api.model.Platform;
import com.nextindie.api.repository.GameRepository;
import com.nextindie.api.repository.GenreRepository;
import com.nextindie.api.repository.PlatformRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.time.YearMonth;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.ArrayList;

@Service
public class RawgSyncService {

    private final RawgApiService rawgApiService;
    private final GameRepository gameRepository;
    private final GenreRepository genreRepository;
    private final PlatformRepository platformRepository;

    public RawgSyncService(RawgApiService rawgApiService,
                           GameRepository gameRepository,
                           GenreRepository genreRepository,
                           PlatformRepository platformRepository) {
        this.rawgApiService = rawgApiService;
        this.gameRepository = gameRepository;
        this.genreRepository = genreRepository;
        this.platformRepository = platformRepository;
    }

    @Transactional
    public void syncCatalogAndCurrentMonthReleases() {
        syncGenres();
        syncPlatforms();
        syncCurrentMonthGames();
    }

    private void syncGenres() {
        JsonNode response = rawgApiService.fetchGenres();
        for (JsonNode genreNode : response.path("results")) {
            String name = genreNode.path("name").asText(null);
            if (name == null || name.isBlank()) {
                continue;
            }
            genreRepository.findByName(name).orElseGet(() -> {
                Genre genre = new Genre();
                genre.setName(name);
                return genreRepository.save(genre);
            });
        }
    }

    private void syncPlatforms() {
        JsonNode response = rawgApiService.fetchPlatforms();
        for (JsonNode platformNode : response.path("results")) {
            String name = platformNode.path("name").asText(null);
            if (name == null || name.isBlank()) {
                continue;
            }
            platformRepository.findByName(name).orElseGet(() -> {
                Platform platform = new Platform();
                platform.setName(name);
                return platformRepository.save(platform);
            });
        }
    }

    private void syncCurrentMonthGames() {
        YearMonth currentMonth = YearMonth.now();
        syncReleasesForMonth(currentMonth.getYear(), currentMonth.getMonthValue());
    }

    @Transactional
    public void syncReleasesForMonth(int year, int month) {
        syncGenres();
        syncPlatforms();
        YearMonth yearMonth = YearMonth.of(year, month);
        LocalDate startDate = yearMonth.atDay(1);
        LocalDate endDate = yearMonth.atEndOfMonth();
        JsonNode response = rawgApiService.fetchReleases(startDate, endDate, 40);
        for (JsonNode gameNode : response.path("results")) {
            upsertGame(gameNode);
        }
    }

    @Transactional
    public List<Game> syncFeedPage(int page, int pageSize) {
        try {
            syncGenres();
            syncPlatforms();
        } catch (RuntimeException ex) {
            return List.of();
        }
        JsonNode response;
        try {
            response = rawgApiService.fetchGamesPage(page, pageSize);
        } catch (RuntimeException ex) {
            return List.of();
        }
        List<Game> games = new ArrayList<>();
        for (JsonNode gameNode : response.path("results")) {
            Game game = upsertGame(gameNode);
            if (game != null) {
                games.add(game);
            }
        }
        return games;
    }

    private Game upsertGame(JsonNode gameNode) {
        Long rawgId = gameNode.path("id").asLong();
        String title = gameNode.path("name").asText(null);
        String releasedValue = gameNode.path("released").asText(null);
        if (rawgId == null || title == null || title.isBlank()) {
            return null;
        }

        LocalDate releaseDate = parseReleaseDateOrNow(releasedValue);
        JsonNode detailsNode;
        try {
            detailsNode = rawgApiService.fetchGameDetails(rawgId);
        } catch (RuntimeException ex) {
            detailsNode = gameNode;
        }

        Optional<Game> existing = gameRepository.findByRawgId(rawgId);
        if (existing.isEmpty()) {
            existing = gameRepository.findByTitleAndReleaseDate(title, releaseDate);
        }

        Game game = existing.orElseGet(Game::new);
        game.setRawgId(rawgId);
        game.setTitle(title);
        game.setDescription(resolveDescription(detailsNode));
        game.setReleaseDate(releaseDate);
        game.setImageUrl(gameNode.path("background_image").asText(null));
        game.setTrailerUrl(resolveTrailerUrl(rawgId, detailsNode, gameNode));
        game.setDeveloper(resolveDeveloper(detailsNode));
        game.setGenres(resolveGenres(gameNode.path("genres")));
        game.setPlatforms(resolvePlatforms(gameNode.path("platforms")));
        return gameRepository.save(game);
    }

    private String resolveTrailerUrl(Long rawgId, JsonNode detailsNode, JsonNode gameNode) {
        try {
            JsonNode movies = rawgApiService.fetchGameMovies(rawgId);
            if (movies.path("results").isArray() && !movies.path("results").isEmpty()) {
                String movieUrl = movies.path("results").get(0).path("data").path("max").asText(null);
                if (movieUrl != null && !movieUrl.isBlank()) {
                    return movieUrl;
                }
            }
        } catch (RuntimeException ignored) {
            // fallback below
        }

        String trailer = detailsNode.path("clip").path("clip").asText(null);
        if (trailer == null || trailer.isBlank()) {
            trailer = gameNode.path("clip").path("clip").asText(null);
        }
        return trailer == null || trailer.isBlank() ? null : trailer;
    }

    private String resolveDeveloper(JsonNode detailsNode) {
        JsonNode developers = detailsNode.path("developers");
        if (developers.isArray() && !developers.isEmpty()) {
            return developers.get(0).path("name").asText("");
        }
        return "Desarrolladora no disponible";
    }

    private String resolveDescription(JsonNode detailsNode) {
        String description = detailsNode.path("description_raw").asText(null);
        if (description == null || description.isBlank()) {
            return "Sin sinopsis disponible";
        }
        return description;
    }

    private LocalDate parseReleaseDateOrNow(String releasedValue) {
        if (releasedValue == null || releasedValue.isBlank()) {
            return LocalDate.now();
        }
        try {
            return LocalDate.parse(releasedValue);
        } catch (DateTimeParseException ex) {
            return LocalDate.now();
        }
    }

    private Set<Genre> resolveGenres(JsonNode genresNode) {
        Set<Genre> genres = new LinkedHashSet<>();
        for (JsonNode genreNode : genresNode) {
            String name = genreNode.path("name").asText(null);
            if (name == null || name.isBlank()) {
                continue;
            }
            Genre genre = genreRepository.findByName(name).orElseGet(() -> {
                Genre newGenre = new Genre();
                newGenre.setName(name);
                return genreRepository.save(newGenre);
            });
            genres.add(genre);
        }
        return genres;
    }

    private Set<Platform> resolvePlatforms(JsonNode platformsNode) {
        Set<Platform> platforms = new LinkedHashSet<>();
        for (JsonNode wrapper : platformsNode) {
            String name = wrapper.path("platform").path("name").asText(null);
            if (name == null || name.isBlank()) {
                continue;
            }
            Platform platform = platformRepository.findByName(name).orElseGet(() -> {
                Platform newPlatform = new Platform();
                newPlatform.setName(name);
                return platformRepository.save(newPlatform);
            });
            platforms.add(platform);
        }
        return platforms;
    }
}
