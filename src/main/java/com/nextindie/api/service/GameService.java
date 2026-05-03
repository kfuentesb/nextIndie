package com.nextindie.api.service;

import com.nextindie.api.dto.GameDTO;
import com.nextindie.api.model.Game;
import com.nextindie.api.model.User;
import com.nextindie.api.repository.GameRepository;
import com.nextindie.api.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class GameService {

    private final GameRepository gameRepository;
    private final UserRepository userRepository;

    public GameService(GameRepository gameRepository, UserRepository userRepository) {
        this.gameRepository = gameRepository;
        this.userRepository = userRepository;
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

    private GameDTO convertToDTO(Game game) {
        return new GameDTO(
                game.getId(),
                game.getTitle(),
                game.getDescription(),
                game.getTrailerUrl(),
                game.getImageUrl(),
                game.getDeveloper(),
                game.getGenres().stream().map(genre -> genre.getName()).collect(Collectors.toList()),
                game.getPlatforms().stream().map(platform -> platform.getName()).collect(Collectors.toList()),
                userRepository.countLikesByGameId(game.getId()),
                game.getReleaseDate()
        );
    }

    private User getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
    }

    private Game getGameByIdOrThrow(Long gameId) {
        return gameRepository.findById(gameId)
                .orElseThrow(() -> new RuntimeException("Juego no encontrado"));
    }
}
