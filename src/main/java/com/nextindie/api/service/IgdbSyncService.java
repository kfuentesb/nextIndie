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

import java.time.Instant;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
public class IgdbSyncService {

    private static final int MAX_MASTER_LIMIT = 200;

    private final IgdbApiService igdbApiService;
    private final GameRepository gameRepository;
    private final GenreRepository genreRepository;
    private final PlatformRepository platformRepository;

    public IgdbSyncService(IgdbApiService igdbApiService,
                           GameRepository gameRepository,
                           GenreRepository genreRepository,
                           PlatformRepository platformRepository) {
        this.igdbApiService = igdbApiService;
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
        JsonNode response = igdbApiService.postQuery("genres", "fields name; limit " + MAX_MASTER_LIMIT + ";");
        for (JsonNode genreNode : response) {
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
        JsonNode response = igdbApiService.postQuery("platforms", "fields name; limit " + MAX_MASTER_LIMIT + ";");
        for (JsonNode platformNode : response) {
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

        long startEpoch = startDate.atStartOfDay(ZoneOffset.UTC).toEpochSecond();
        long endEpoch = endDate.plusDays(1).atStartOfDay(ZoneOffset.UTC).toEpochSecond();

        String query = buildGameFields()
                + " where first_release_date >= " + startEpoch
                + " & first_release_date < " + endEpoch
                + " & name != null;"
                + " sort first_release_date asc;"
                + " limit 100;";

        JsonNode response = igdbApiService.postQuery("games", query);
        for (JsonNode gameNode : response) {
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

        int safePage = Math.max(1, page);
        int safeSize = Math.max(1, Math.min(pageSize, 20));
        int offset = (safePage - 1) * safeSize;

        String query = buildGameFields()
                + " where first_release_date != null & name != null & videos != null;"
                + " sort first_release_date desc;"
                + " limit " + safeSize + ";"
                + " offset " + offset + ";";

        JsonNode response;
        try {
            response = igdbApiService.postQuery("games", query);
        } catch (RuntimeException ex) {
            return List.of();
        }

        List<Game> games = new ArrayList<>();
        for (JsonNode gameNode : response) {
            Game game = upsertGame(gameNode);
            if (game != null && game.getTrailerUrl() != null && !game.getTrailerUrl().isBlank()) {
                games.add(game);
            }
        }
        return games;
    }

    private String buildGameFields() {
        return "fields id,name,summary,cover.url,videos.video_id,"
                + "involved_companies.company.name,involved_companies.developer,"
                + "genres.name,platforms.name,status,websites.url,similar_games.name,"
                + "franchise.name,franchises.name,first_release_date;";
    }

    private Game upsertGame(JsonNode gameNode) {
        Long igdbId = gameNode.path("id").asLong();
        String title = gameNode.path("name").asText(null);
        if (igdbId == null || title == null || title.isBlank()) {
            return null;
        }

        LocalDate releaseDate = parseReleaseDate(gameNode.path("first_release_date").asLong(0));
        Optional<Game> existing = gameRepository.findByIgdbId(igdbId);
        if (existing.isEmpty()) {
            existing = gameRepository.findByTitleAndReleaseDate(title, releaseDate);
        }

        Game game = existing.orElseGet(Game::new);
        game.setIgdbId(igdbId);
        game.setTitle(title);
        game.setDescription(resolveDescription(gameNode));
        game.setReleaseDate(releaseDate);
        game.setImageUrl(resolveCoverUrl(gameNode.path("cover").path("url").asText(null)));
        game.setTrailerUrl(resolveTrailerUrl(gameNode.path("videos")));
        game.setDeveloper(resolveDeveloper(gameNode.path("involved_companies")));
        game.setGameStatus(resolveStatus(gameNode.path("status")));
        game.setWebsiteUrl(resolveWebsite(gameNode.path("websites")));
        game.setMainFranchise(resolveFranchise(gameNode));
        game.setGenres(resolveGenres(gameNode.path("genres")));
        game.setPlatforms(resolvePlatforms(gameNode.path("platforms")));
        game.setSimilarGames(resolveNameList(gameNode.path("similar_games"), 8));

        return gameRepository.save(game);
    }

    private String resolveTrailerUrl(JsonNode videosNode) {
        if (videosNode.isArray() && !videosNode.isEmpty()) {
            String videoId = videosNode.get(0).path("video_id").asText(null);
            if (videoId != null && !videoId.isBlank()) {
                return "https://www.youtube.com/watch?v=" + videoId;
            }
        }
        return null;
    }

    private String resolveDeveloper(JsonNode involvedCompanies) {
        if (involvedCompanies.isArray()) {
            for (JsonNode companyNode : involvedCompanies) {
                if (companyNode.path("developer").asBoolean(false)) {
                    String name = companyNode.path("company").path("name").asText(null);
                    if (name != null && !name.isBlank()) {
                        return name;
                    }
                }
            }
            if (!involvedCompanies.isEmpty()) {
                String fallback = involvedCompanies.get(0).path("company").path("name").asText(null);
                if (fallback != null && !fallback.isBlank()) {
                    return fallback;
                }
            }
        }
        return "Desarrolladora no disponible";
    }

    private String resolveDescription(JsonNode detailsNode) {
        String description = detailsNode.path("summary").asText(null);
        if (description == null || description.isBlank()) {
            return "Sin sinopsis disponible";
        }
        return description;
    }

    private LocalDate parseReleaseDate(long epochSeconds) {
        if (epochSeconds <= 0) {
            return LocalDate.now();
        }
        return Instant.ofEpochSecond(epochSeconds).atZone(ZoneOffset.UTC).toLocalDate();
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
        for (JsonNode platformNode : platformsNode) {
            String name = platformNode.path("name").asText(null);
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

    private String resolveCoverUrl(String url) {
        if (url == null || url.isBlank()) {
            return null;
        }
        String normalized = url.startsWith("//") ? "https:" + url : url;
        return normalized.replace("t_thumb", "t_cover_big");
    }

    private String resolveStatus(JsonNode statusNode) {
        if (statusNode == null || statusNode.isNull()) {
            return null;
        }
        int status = statusNode.asInt(-1);
        return switch (status) {
            case 0 -> "Lanzado";
            case 2 -> "Alpha";
            case 3 -> "Beta";
            case 4 -> "Acceso anticipado";
            case 5 -> "Offline";
            case 6 -> "Cancelado";
            case 7 -> "Rumor";
            case 8 -> "Retirado";
            default -> "Desconocido";
        };
    }

    private String resolveWebsite(JsonNode websitesNode) {
        if (websitesNode.isArray() && !websitesNode.isEmpty()) {
            String url = websitesNode.get(0).path("url").asText(null);
            if (url != null && !url.isBlank()) {
                return url;
            }
        }
        return null;
    }

    private String resolveFranchise(JsonNode gameNode) {
        JsonNode franchise = gameNode.path("franchise");
        if (franchise.isObject()) {
            String name = franchise.path("name").asText(null);
            if (name != null && !name.isBlank()) {
                return name;
            }
        }
        JsonNode franchises = gameNode.path("franchises");
        if (franchises.isArray() && !franchises.isEmpty()) {
            String name = franchises.get(0).path("name").asText(null);
            if (name != null && !name.isBlank()) {
                return name;
            }
        }
        return null;
    }

    private Set<String> resolveNameList(JsonNode listNode, int maxItems) {
        Set<String> values = new LinkedHashSet<>();
        if (!listNode.isArray()) {
            return values;
        }
        for (JsonNode node : listNode) {
            if (values.size() >= maxItems) {
                break;
            }
            String name = node.path("name").asText(null);
            if (name != null && !name.isBlank()) {
                values.add(name);
            }
        }
        return values;
    }
}
