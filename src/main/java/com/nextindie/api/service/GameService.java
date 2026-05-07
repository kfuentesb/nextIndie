package com.nextindie.api.service;

import com.nextindie.api.dto.GameDTO;
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

    private static final int LIKE_WEIGHT = 1;
    private static final int SAVE_WEIGHT = 2;
    private static final int COMMENT_UNIQUE_USER_WEIGHT = 1;
    private static final int RANKING_LIMIT = 10;

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
        return gameRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public GameDTO getGameById(Long id) {
        Game game = gameRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Juego no encontrado"));
        return convertToDTO(game);
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
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public GameFeedResponseDTO getFeedPage(int page, int size) {
        int safePage = Math.max(1, page);
        int safeSize = Math.max(1, Math.min(size, 20));

        List<Game> syncedGames = igdbSyncService.syncFeedPage(safePage, safeSize);
        if (!syncedGames.isEmpty()) {
            List<GameDTO> games = syncedGames.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
            return new GameFeedResponseDTO(games, safePage, games.size() == safeSize);
        }

        List<GameDTO> fallbackGames = gameRepository.findAll(
                        PageRequest.of(safePage - 1, safeSize, Sort.by(Sort.Direction.DESC, "createdAt"))
                ).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());

        return new GameFeedResponseDTO(fallbackGames, safePage, fallbackGames.size() == safeSize);
    }

    public List<GameDTO> getReleasesByMonth(int year, int month) {
        igdbSyncService.syncReleasesForMonth(year, month);
        YearMonth yearMonth = YearMonth.of(year, month);
        LocalDate startDate = yearMonth.atDay(1);
        LocalDate endDate = yearMonth.atEndOfMonth();
        return gameRepository.findByReleaseDateBetweenOrderByReleaseDateAsc(startDate, endDate).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<GameDTO> getCurrentMonthRanking() {
        YearMonth currentMonth = YearMonth.from(LocalDate.now());
        igdbSyncService.syncReleasesForMonth(currentMonth.getYear(), currentMonth.getMonthValue());

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
                .map(ranked -> convertToDTO(ranked.game(), ranked.likes()))
                .collect(Collectors.toList());
    }

    private GameDTO convertToDTO(Game game) {
        return convertToDTO(game, userRepository.countLikesByGameId(game.getId()));
    }

    private GameDTO convertToDTO(Game game, long totalLikes) {
        return new GameDTO(
            game.getId(),
            game.getTitle(),
            game.getDescription(),
            game.getTrailerUrl(),
            game.getImageUrl(),
            game.getDeveloper(),
            game.getGameStatus(),
            game.getWebsiteUrl(),
            game.getMainFranchise(),
            game.getGenres().stream().map(genre -> genre.getName()).collect(Collectors.toList()),
            game.getPlatforms().stream().map(platform -> platform.getName()).collect(Collectors.toList()),
            game.getSimilarGames().stream().collect(Collectors.toList()),
            game.getDlcs().stream().collect(Collectors.toList()),
            totalLikes,
            game.getReleaseDate()
        );
    }

    private RankedGame buildRankedGame(Game game) {
        long likes = userRepository.countLikesByGameId(game.getId());
        long saves = userRepository.countSavesByGameId(game.getId());
        long uniqueCommenters = commentRepository.countDistinctUserIdByGameId(game.getId());
        long score = (likes * LIKE_WEIGHT) + (saves * SAVE_WEIGHT) + (uniqueCommenters * COMMENT_UNIQUE_USER_WEIGHT);
        return new RankedGame(game, likes, saves, uniqueCommenters, score);
    }

    private User getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
    }

    private Game getGameByIdOrThrow(Long gameId) {
        return gameRepository.findById(gameId)
                .orElseThrow(() -> new RuntimeException("Juego no encontrado"));
    }

    private record RankedGame(Game game, long likes, long saves, long commenters, long score) {}
}
