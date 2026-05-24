package com.nextindie.api.controller;

import com.nextindie.api.dto.LookupItem;
import com.nextindie.api.repository.GameRepository;
import com.nextindie.api.repository.GenreRepository;
import com.nextindie.api.repository.PlatformRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/lookups")
public class LookupController {

    private final GenreRepository genreRepository;
    private final PlatformRepository platformRepository;
    private final GameRepository gameRepository;

    public LookupController(GenreRepository genreRepository,
                            PlatformRepository platformRepository,
                            GameRepository gameRepository) {
        this.genreRepository = genreRepository;
        this.platformRepository = platformRepository;
        this.gameRepository = gameRepository;
    }

    @GetMapping("/genres")
    public ResponseEntity<List<LookupItem>> getGenres() {
        List<LookupItem> items = genreRepository.findAll().stream()
                .map(genre -> new LookupItem(genre.getId(), genre.getName()))
                .sorted(Comparator.comparing(LookupItem::getName, String.CASE_INSENSITIVE_ORDER))
                .collect(Collectors.toList());
        return ResponseEntity.ok(items);
    }

    @GetMapping("/platforms")
    public ResponseEntity<List<LookupItem>> getPlatforms() {
        List<LookupItem> items = platformRepository.findAll().stream()
                .map(platform -> new LookupItem(platform.getId(), platform.getName()))
                .sorted(Comparator.comparing(LookupItem::getName, String.CASE_INSENSITIVE_ORDER))
                .collect(Collectors.toList());
        return ResponseEntity.ok(items);
    }

    @GetMapping("/games")
    public ResponseEntity<List<LookupItem>> getGames() {
        List<LookupItem> items = gameRepository.findAll().stream()
                .map(game -> new LookupItem(game.getId(), game.getTitle()))
                .sorted(Comparator.comparing(LookupItem::getName, String.CASE_INSENSITIVE_ORDER))
                .collect(Collectors.toList());
        return ResponseEntity.ok(items);
    }
}
