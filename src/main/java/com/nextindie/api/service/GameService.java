package com.nextindie.api.service;

import com.nextindie.api.model.dto.GameDTO;
import com.nextindie.api.model.Game;
import com.nextindie.api.repository.GameRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class GameService {

    private final GameRepository gameRepository;

    public GameService(GameRepository gameRepository) {
        this.gameRepository = gameRepository;
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

    private GameDTO convertToDTO(Game game) {
        return new GameDTO(
                game.getId(),
                game.getTitle(),
                game.getDescription(),
                game.getTrailerUrl(),
                game.getImageUrl(),
                game.getDeveloper(),
                game.getGenre(),
                game.getReleaseDate()
        );
    }
}