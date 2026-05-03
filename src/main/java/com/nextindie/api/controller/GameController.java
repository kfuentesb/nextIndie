package com.nextindie.api.controller;

import com.nextindie.api.dto.GameDTO;
import com.nextindie.api.service.GameService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/games")
@CrossOrigin(origins = "http://localhost:5173")
public class GameController {

    private final GameService gameService;

    public GameController(GameService gameService) {
        this.gameService = gameService;
    }

    @GetMapping
    public ResponseEntity<List<GameDTO>> getAllGames() {
        return ResponseEntity.ok(gameService.getAllGames());
    }

    @GetMapping("/{id}")
    public ResponseEntity<GameDTO> getGameById(@PathVariable Long id) {
        return ResponseEntity.ok(gameService.getGameById(id));
    }

    @PostMapping("/{id}/likes")
    public ResponseEntity<Void> likeGame(@PathVariable Long id, Authentication authentication) {
        gameService.likeGame(id, authentication.getName());
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}/likes")
    public ResponseEntity<Void> unlikeGame(@PathVariable Long id, Authentication authentication) {
        gameService.unlikeGame(id, authentication.getName());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/likes/count")
    public ResponseEntity<Map<String, Long>> getLikesCount(@PathVariable Long id) {
        return ResponseEntity.ok(Map.of("count", gameService.getLikesCount(id)));
    }

    @PostMapping("/{id}/saved")
    public ResponseEntity<Void> saveGame(@PathVariable Long id, Authentication authentication) {
        gameService.saveGame(id, authentication.getName());
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}/saved")
    public ResponseEntity<Void> unsaveGame(@PathVariable Long id, Authentication authentication) {
        gameService.unsaveGame(id, authentication.getName());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me/saved")
    public ResponseEntity<List<GameDTO>> getSavedGames(Authentication authentication) {
        return ResponseEntity.ok(gameService.getSavedGames(authentication.getName()));
    }
}
