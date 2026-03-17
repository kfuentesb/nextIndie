package com.nextindie.api.controller;

import com.nextindie.model.dto.GameDTO;
import com.nextindie.model.dto.GameDetailDTO;
import com.nextindie.service.GameService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/games")
@CrossOrigin(origins = "http://localhost:4200")
public class GameController {

    @Autowired
    private GameService gameService;

    // FEED PRINCIPAL - GET /api/games/feed?page=0&size=10
    @GetMapping("/feed")
    public ResponseEntity<List<GameDTO>> getFeed(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(gameService.getFeedGames(page, size));
    }

    // CALENDARIO - GET /api/games/calendar?userId=1
    @GetMapping("/calendar")
    public ResponseEntity<List<GameDTO>> getCalendar(@RequestParam Long userId) {
        return ResponseEntity.ok(gameService.getCalendarGames(userId));
    }

    // DESCUBRIMIENTO ALEATORIO - GET /api/games/random
    @GetMapping("/random")
    public ResponseEntity<GameDTO> getRandomGame() {
        return ResponseEntity.ok(gameService.getRandomGame());
    }

    // DETALLE - GET /api/games/{id}?userId=1
    @GetMapping("/{id}")
    public ResponseEntity<GameDetailDTO> getGameDetail(
            @PathVariable Long id,
            @RequestParam Long userId) {
        return ResponseEntity.ok(gameService.getGameDetail(id, userId));
    }

    // LIKE - POST /api/games/{id}/like
    @PostMapping("/{id}/like")
    public ResponseEntity<Void> toggleLike(@PathVariable Long id, @RequestParam Long userId) {
        gameService.toggleLike(id, userId);
        return ResponseEntity.ok().build();
    }
}