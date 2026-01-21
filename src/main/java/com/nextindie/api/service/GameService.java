package com.nextindie.api.service;

import com.nextindie.api.model.Game;
import com.nextindie.api.repository.GameRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class GameService {

    @Autowired
    private GameRepository gameRepository; // Inyectamos la herramienta de la DB

    public List<Game> obtenerTodosLosJuegos() {
        return gameRepository.findAll();
    }

    public Game guardarJuego(Game game) {
        return gameRepository.save(game);
    }
}