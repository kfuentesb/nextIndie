package com.nextindie.api.service;

import com.nextindie.model.entity.Game;
import com.nextindie.model.dto.GameDTO;
import com.nextindie.model.dto.GameDetailDTO;
import com.nextindie.repository.GameRepository;
import com.nextindie.repository.GameLikeRepository;
import com.nextindie.repository.GameSaveRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class GameService {

    @Autowired
    private GameRepository gameRepository;

    @Autowired
    private GameLikeRepository likeRepository;

    @Autowired
    private GameSaveRepository saveRepository;

    // FEED PRINCIPAL (TikTok style)
    public List<GameDTO> getFeedGames(int page, int size) {
        return gameRepository.findFeedGames(PageRequest.of(page, size))
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // CALENDARIO: Prioridad a guardados, luego más votados
    public List<GameDTO> getCalendarGames(Long userId) {
        LocalDate today = LocalDate.now();

        // 1. Juegos guardados por el usuario (prioridad alta)
        List<GameDTO> savedGames = gameRepository.findSavedGamesByUser(userId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());

        // 2. Próximos lanzamientos populares (excluyendo ya guardados)
        List<Long> savedIds = savedGames.stream().map(GameDTO::getId).collect(Collectors.toList());
        List<GameDTO> upcomingGames = gameRepository.findUpcomingGames(today)
                .stream()
                .filter(g -> !savedIds.contains(g.getId()))
                .map(this::convertToDTO)
                .collect(Collectors.toList());

        // Combinar: primero guardados, luego populares
        savedGames.addAll(upcomingGames);
        return savedGames;
    }

    // DESCUBRIMIENTO ALEATORIO
    public GameDTO getRandomGame() {
        Game game = gameRepository.findRandomGame();
        return convertToDTO(game);
    }

    // DETALLE DEL JUEGO
    public GameDetailDTO getGameDetail(Long gameId, Long userId) {
        Game game = gameRepository.findById(gameId)
                .orElseThrow(() -> new RuntimeException("Juego no encontrado"));

        GameDetailDTO detail = new GameDetailDTO();
        detail.setGame(convertToDTO(game));
        detail.setRelatedGames(
                gameRepository.findRelatedGames(game.getGenre().getId(), gameId, PageRequest.of(0, 5))
                        .stream()
                        .map(this::convertToDTO)
                        .collect(Collectors.toList())
        );
        detail.setLikedByUser(likeRepository.existsByUserIdAndGameId(userId, gameId));
        detail.setSavedByUser(saveRepository.existsByUserIdAndGameId(userId, gameId));

        return detail;
    }

    // LIKE/UNLIKE
    public void toggleLike(Long gameId, Long userId) {
        if (likeRepository.existsByUserIdAndGameId(userId, gameId)) {
            likeRepository.deleteByUserIdAndGameId(userId, gameId);
        } else {
            // Crear like
        }
    }

    private GameDTO convertToDTO(Game game) {
        GameDTO dto = new GameDTO();
        dto.setId(game.getId());
        dto.setTitle(game.getTitle());
        dto.setDescription(game.getDescription());
        dto.setGenre(game.getGenre().getName());
        dto.setTrailerUrl(game.getTrailerUrl());
        dto.setThumbnailUrl(game.getThumbnailUrl());
        dto.setReleaseDate(game.getReleaseDate());
        dto.setPlayerMode(game.getPlayerMode());
        dto.setLikesCount(game.getLikesCount());
        return dto;
    }
}