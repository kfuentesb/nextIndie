package com.nextindie.api.controller;

import com.nextindie.api.model.Game;
import com.nextindie.api.service.GameService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/games") // La URL base será http://localhost:8080/api/games
@CrossOrigin(origins = "*")   // 
public class GameController {

    @Autowired
    private GameService gameService;

    @GetMapping
    public List<Game> listarJuegos() {
        return gameService.obtenerTodosLosJuegos();
    }

    @PostMapping
    public Game crearJuego(@RequestBody Game game) {
        return gameService.guardarJuego(game);
    }
}