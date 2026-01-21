package com.nextindie.api.repository;

import com.nextindie.api.model.Game;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GameRepository extends JpaRepository<Game, Integer> {
    // Aquí no hace falta escribir nada más por ahora.
}