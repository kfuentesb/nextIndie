package com.nextindie.api.repository;

import com.nextindie.api.model.Game;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface GameRepository extends JpaRepository<Game, Long> {

    // Feed principal: juegos aprobados ordenados por likes
    @Query("SELECT g FROM Game g WHERE g.status = 'APPROVED' ORDER BY g.likesCount DESC")
    List<Game> findFeedGames(Pageable pageable);

    // Juegos por género
    List<Game> findByGenreIdAndStatus(Long genreId, String status);

    // Calendario: próximos lanzamientos ordenados por likes
    @Query("SELECT g FROM Game g WHERE g.status = 'APPROVED' AND g.releaseDate >= :date ORDER BY g.likesCount DESC")
    List<Game> findUpcomingGames(@Param("date") LocalDate date);

    // Juegos guardados por usuario para calendario prioritario
    @Query("SELECT g FROM Game g JOIN GameSave gs ON g.id = gs.gameId WHERE gs.userId = :userId AND g.status = 'APPROVED' ORDER BY g.releaseDate")
    List<Game> findSavedGamesByUser(@Param("userId") Long userId);

    // Juego aleatorio aprobado
    @Query(value = "SELECT * FROM nextindie.games WHERE status = 'APPROVED' ORDER BY RANDOM() LIMIT 1", nativeQuery = true)
    Game findRandomGame();

    // Juegos relacionados del mismo género
    @Query("SELECT g FROM Game g WHERE g.genre.id = :genreId AND g.id != :gameId AND g.status = 'APPROVED' ORDER BY g.likesCount DESC")
    List<Game> findRelatedGames(@Param("genreId") Long genreId, @Param("gameId") Long gameId, Pageable pageable);
}