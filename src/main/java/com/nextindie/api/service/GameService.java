package com.nextindie.api.service;

import com.nextindie.api.dto.GameDTO;
import com.nextindie.api.dto.GameImageUrls;
import com.nextindie.api.dto.GameFeedResponseDTO;
import com.nextindie.api.model.Game;
import com.nextindie.api.model.User;
import com.nextindie.api.repository.CommentRepository;
import com.nextindie.api.repository.GameRepository;
import com.nextindie.api.repository.UserRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class GameService {
    private static final String IGDB_IMAGE_SIZE = "t_720p";

    private static final int LIKE_WEIGHT = 1;
    private static final int SAVE_WEIGHT = 2;
    private static final int COMMENT_UNIQUE_USER_WEIGHT = 1;
    private static final int RANKING_LIMIT = 50;

    private final GameRepository gameRepository;
    private final UserRepository userRepository;
    private final CommentRepository commentRepository;
    private final IgdbSyncService igdbSyncService;

    public GameService(GameRepository gameRepository,
                       UserRepository userRepository,
                       CommentRepository commentRepository,
                       IgdbSyncService igdbSyncService) {
        this.gameRepository = gameRepository;
        this.userRepository = userRepository;
        this.commentRepository = commentRepository;
        this.igdbSyncService = igdbSyncService;
    }

    public List<GameDTO> getAllGames() {
        return getAllGames(null);
    }

    public List<GameDTO> getAllGames(String username) {
        return gameRepository.findAll().stream()
                .map(game -> convertToDTO(game, username))
                .collect(Collectors.toList());
    }

    public GameDTO getGameById(Long id) {
        return getGameById(id, null);
    }

    public GameDTO getGameById(Long id, String username) {
        Game game = gameRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Juego no encontrado"));
        return convertToDTO(game, username);
    }

    @Transactional
    public void likeGame(Long gameId, String username) {
        User user = getUserByUsername(username);
        Game game = getGameByIdOrThrow(gameId);
        user.getLikedGames().add(game);
        userRepository.save(user);
    }

    @Transactional
    public void unlikeGame(Long gameId, String username) {
        User user = getUserByUsername(username);
        Game game = getGameByIdOrThrow(gameId);
        user.getLikedGames().remove(game);
        userRepository.save(user);
    }

    public long getLikesCount(Long gameId) {
        getGameByIdOrThrow(gameId);
        return userRepository.countLikesByGameId(gameId);
    }

    @Transactional
    public void saveGame(Long gameId, String username) {
        User user = getUserByUsername(username);
        Game game = getGameByIdOrThrow(gameId);
        user.getSavedGames().add(game);
        userRepository.save(user);
    }

    @Transactional
    public void unsaveGame(Long gameId, String username) {
        User user = getUserByUsername(username);
        Game game = getGameByIdOrThrow(gameId);
        user.getSavedGames().remove(game);
        userRepository.save(user);
    }

    public List<GameDTO> getSavedGames(String username) {
        getUserByUsername(username);
        return userRepository.findSavedGamesByUsername(username).stream()
                .map(game -> convertToDTO(game, username))
                .collect(Collectors.toList());
    }

    public List<GameDTO> getCompanyGames(String username) {
        getUserByUsername(username);
        return gameRepository.findByRequestedByUsername(username).stream()
                .map(game -> convertToDTO(game, username))
                .collect(Collectors.toList());
    }

    public GameFeedResponseDTO getFeedPage(int page, int size) {
        return getFeedPage(page, size, null);
    }

    public GameFeedResponseDTO getFeedPage(int page, int size, String username) {
        int safePage = Math.max(1, page);
        int safeSize = Math.max(1, Math.min(size, 60));

        List<Game> syncedGames = igdbSyncService.syncFeedPage(safePage, safeSize);
        if (!syncedGames.isEmpty()) {
                List<GameDTO> games = syncedGames.stream()
                    .map(game -> convertToDTO(game, username))
                    .collect(Collectors.toList());
            return new GameFeedResponseDTO(games, safePage, games.size() == safeSize);
        }

        List<GameDTO> fallbackGames = gameRepository.findByTrailerUrlIsNotNullAndTrailerUrlNot(
                        "",
                        PageRequest.of(safePage - 1, safeSize, Sort.by(Sort.Direction.DESC, "createdAt"))
                ).stream()
            .map(game -> convertToDTO(game, username))
                .collect(Collectors.toList());

        return new GameFeedResponseDTO(fallbackGames, safePage, fallbackGames.size() == safeSize);
    }

    public List<GameDTO> getReleasesByMonth(int year, int month) {
        return getReleasesByMonth(year, month, null);
    }

    public List<GameDTO> getReleasesByMonth(int year, int month, String username) {
        try {
            igdbSyncService.syncReleasesForMonth(year, month);
        } catch (RuntimeException ex) {
            // Fallback a datos locales si IGDB falla.
        }
        YearMonth yearMonth = YearMonth.of(year, month);
        LocalDate startDate = yearMonth.atDay(1);
        LocalDate endDate = yearMonth.atEndOfMonth();
        return gameRepository.findByReleaseDateBetweenOrderByReleaseDateAsc(startDate, endDate).stream()
                .map(this::buildRankedGame)
                .sorted((left, right) -> {
                    int dateCompare = left.game().getReleaseDate().compareTo(right.game().getReleaseDate());
                    if (dateCompare != 0) return dateCompare;

                    int scoreCompare = Long.compare(right.score(), left.score());
                    if (scoreCompare != 0) return scoreCompare;

                    int savesCompare = Long.compare(right.saves(), left.saves());
                    if (savesCompare != 0) return savesCompare;

                    int likesCompare = Long.compare(right.likes(), left.likes());
                    if (likesCompare != 0) return likesCompare;

                    int commentersCompare = Long.compare(right.commenters(), left.commenters());
                    if (commentersCompare != 0) return commentersCompare;

                    return left.game().getTitle().compareToIgnoreCase(right.game().getTitle());
                })
                .map(ranked -> convertToDTO(ranked.game(), ranked.likes(), ranked.saves(), ranked.totalComments(), username))
                .collect(Collectors.toList());
    }

    public List<GameDTO> getCurrentMonthRanking() {
        return getCurrentMonthRanking(null);
    }

    public List<GameDTO> getCurrentMonthRanking(String username) {
        YearMonth currentMonth = YearMonth.from(LocalDate.now());
        try {
            igdbSyncService.syncReleasesForMonth(currentMonth.getYear(), currentMonth.getMonthValue());
        } catch (RuntimeException ex) {
            // Fallback a datos locales si IGDB falla.
        }

        LocalDate startDate = currentMonth.atDay(1);
        LocalDate endDate = currentMonth.atEndOfMonth();

        return gameRepository.findByReleaseDateBetweenOrderByReleaseDateAsc(startDate, endDate).stream()
                .map(this::buildRankedGame)
                .sorted((left, right) -> {
                    int scoreCompare = Long.compare(right.score(), left.score());
                    if (scoreCompare != 0) return scoreCompare;

                    int savesCompare = Long.compare(right.saves(), left.saves());
                    if (savesCompare != 0) return savesCompare;

                    int likesCompare = Long.compare(right.likes(), left.likes());
                    if (likesCompare != 0) return likesCompare;

                    int commentersCompare = Long.compare(right.commenters(), left.commenters());
                    if (commentersCompare != 0) return commentersCompare;

                    int releaseDateCompare = left.game().getReleaseDate().compareTo(right.game().getReleaseDate());
                    if (releaseDateCompare != 0) return releaseDateCompare;

                    return left.game().getTitle().compareToIgnoreCase(right.game().getTitle());
                })
                .limit(RANKING_LIMIT)
                .map(ranked -> convertToDTO(ranked.game(), ranked.likes(), ranked.saves(), ranked.totalComments(), username))
                .collect(Collectors.toList());
    }

    private GameDTO convertToDTO(Game game) {
        return convertToDTO(game, null);
    }

    private GameDTO convertToDTO(Game game, String username) {
        long totalLikes = userRepository.countLikesByGameId(game.getId());
        long totalSaves = userRepository.countSavesByGameId(game.getId());
        long totalComments = commentRepository.countByGameId(game.getId());
        return convertToDTO(game, totalLikes, totalSaves, totalComments, username);
    }

    private GameDTO convertToDTO(Game game, long totalLikes, long totalSaves, long totalComments, String username) {
        boolean likedByMe = false;
        boolean savedByMe = false;
        if (username != null) {
            likedByMe = userRepository.hasLikedGame(username, game.getId());
            savedByMe = userRepository.hasSavedGame(username, game.getId());
        }
        return convertToDTO(game, totalLikes, totalSaves, totalComments, likedByMe, savedByMe);
    }

    private GameDTO convertToDTO(Game game, long totalLikes, long totalSaves, long totalComments,
                                 boolean likedByMe, boolean savedByMe) {
        GameDTO dto = new GameDTO(
            game.getId(),
            game.getTitle(),
            game.getDescription(),
            game.getTrailerUrl(),
            normalizeCoverUrl(game.getImageUrl()),
            game.getDeveloper(),
            game.getGameStatus(),
            game.getWebsiteUrl(),
            game.getMainFranchise(),
            game.getGenres().stream().map(genre -> genre.getName()).collect(Collectors.toList()),
            game.getPlatforms().stream().map(platform -> platform.getName()).collect(Collectors.toList()),
            game.getSimilarGames().stream().collect(Collectors.toList()),
            totalLikes,
            totalSaves,
            totalComments,
            game.getReleaseDate(),
            likedByMe,
            savedByMe
        );
        dto.setImageUrls(buildImageUrls(game.getImageUrl()));
        return dto;
    }

    private String normalizeCoverUrl(String url) {
        if (url == null || url.isBlank()) {
            return url;
        }
        if (!url.contains("igdb.com/igdb/image/upload/")) {
            return url;
        }
        return url.replaceAll("/t_[^/]+/", "/" + IGDB_IMAGE_SIZE + "/");
    }

    private GameImageUrls buildImageUrls(String url) {
        if (url == null || url.isBlank()) {
            return null;
        }

        GameImageUrls imageUrls = new GameImageUrls();

        if (!url.contains("igdb.com/igdb/image/upload/")) {
            imageUrls.setMicro(url);
            imageUrls.setThumb(url);
            imageUrls.setCoverSmall(url);
            imageUrls.setLogoMed(url);
            imageUrls.setScreenshotMed(url);
            imageUrls.setCoverBig(url);
            imageUrls.setScreenshotBig(url);
            imageUrls.setScreenshotHuge(url);
            imageUrls.setSize720p(url);
            imageUrls.setSize1080p(url);
            imageUrls.setMicro2x(url);
            imageUrls.setThumb2x(url);
            imageUrls.setCoverSmall2x(url);
            imageUrls.setLogoMed2x(url);
            imageUrls.setScreenshotMed2x(url);
            imageUrls.setCoverBig2x(url);
            imageUrls.setScreenshotBig2x(url);
            imageUrls.setScreenshotHuge2x(url);
            imageUrls.setSize720p2x(url);
            imageUrls.setSize1080p2x(url);
            return imageUrls;
        }

        imageUrls.setMicro(replaceIgdbSize(url, "t_micro"));
        imageUrls.setThumb(replaceIgdbSize(url, "t_thumb"));
        imageUrls.setCoverSmall(replaceIgdbSize(url, "t_cover_small"));
        imageUrls.setLogoMed(replaceIgdbSize(url, "t_logo_med"));
        imageUrls.setScreenshotMed(replaceIgdbSize(url, "t_screenshot_med"));
        imageUrls.setCoverBig(replaceIgdbSize(url, "t_cover_big"));
        imageUrls.setScreenshotBig(replaceIgdbSize(url, "t_screenshot_big"));
        imageUrls.setScreenshotHuge(replaceIgdbSize(url, "t_screenshot_huge"));
        imageUrls.setSize720p(replaceIgdbSize(url, "t_720p"));
        imageUrls.setSize1080p(replaceIgdbSize(url, "t_1080p"));
        imageUrls.setMicro2x(replaceIgdbSize(url, "t_micro_2x"));
        imageUrls.setThumb2x(replaceIgdbSize(url, "t_thumb_2x"));
        imageUrls.setCoverSmall2x(replaceIgdbSize(url, "t_cover_small_2x"));
        imageUrls.setLogoMed2x(replaceIgdbSize(url, "t_logo_med_2x"));
        imageUrls.setScreenshotMed2x(replaceIgdbSize(url, "t_screenshot_med_2x"));
        imageUrls.setCoverBig2x(replaceIgdbSize(url, "t_cover_big_2x"));
        imageUrls.setScreenshotBig2x(replaceIgdbSize(url, "t_screenshot_big_2x"));
        imageUrls.setScreenshotHuge2x(replaceIgdbSize(url, "t_screenshot_huge_2x"));
        imageUrls.setSize720p2x(replaceIgdbSize(url, "t_720p_2x"));
        imageUrls.setSize1080p2x(replaceIgdbSize(url, "t_1080p_2x"));
        return imageUrls;
    }

    private String replaceIgdbSize(String url, String size) {
        return url.replaceAll("/t_[^/]+/", "/" + size + "/");
    }

    private RankedGame buildRankedGame(Game game) {
        long likes = userRepository.countLikesByGameId(game.getId());
        long saves = userRepository.countSavesByGameId(game.getId());
        long uniqueCommenters = commentRepository.countDistinctUserIdByGameId(game.getId());
        long totalComments = commentRepository.countByGameId(game.getId());
        long score = (likes * LIKE_WEIGHT) + (saves * SAVE_WEIGHT) + (uniqueCommenters * COMMENT_UNIQUE_USER_WEIGHT);
        return new RankedGame(game, likes, saves, uniqueCommenters, totalComments, score);
    }

    private User getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
    }

    private Game getGameByIdOrThrow(Long gameId) {
        return gameRepository.findById(gameId)
                .orElseThrow(() -> new RuntimeException("Juego no encontrado"));
    }

    private record RankedGame(Game game, long likes, long saves, long commenters, long totalComments, long score) {}
}
