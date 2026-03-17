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

    /**
     * Busca juegos relacionados del mismo género, excluyendo el juego actual
     * Usado en la página de detalle para mostrar juegos similares
     */
    @Query("SELECT g FROM Game g WHERE g.genre.id = :genreId AND g.id != :excludeGameId ORDER BY g.likesCount DESC")
    List<Game> findRelatedGames(@Param("genreId") Long genreId, @Param("excludeGameId") Long excludeGameId, Pageable pageable);

    /**
     * Busca juegos por género con paginación
     */
    List<Game> findByGenreId(Long genreId, Pageable pageable);

    /**
     * Busca juegos por modo de jugador
     */
    List<Game> findByPlayerMode(String playerMode, Pageable pageable);

    /**
     * Busca juegos próximos a lanzarse (no lanzados aún)
     */
    @Query("SELECT g FROM Game g WHERE g.releaseDate > :today ORDER BY g.releaseDate ASC")
    List<Game> findUpcomingGames(@Param("today") LocalDate today, Pageable pageable);

    /**
     * Busca juegos ya lanzados
     */
    @Query("SELECT g FROM Game g WHERE g.releaseDate <= :today ORDER BY g.releaseDate DESC")
    List<Game> findReleasedGames(@Param("today") LocalDate today, Pageable pageable);

    /**
     * Busca juegos por rango de fechas (para calendario)
     */
    @Query("SELECT g FROM Game g WHERE g.releaseDate BETWEEN :startDate AND :endDate ORDER BY g.releaseDate ASC")
    List<Game> findByReleaseDateBetween(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    /**
     * Busca juegos que se lanzan en una fecha específica
     */
    List<Game> findByReleaseDate(LocalDate releaseDate);

    /**
     * Busca juegos por título (búsqueda parcial, case insensitive)
     */
    @Query("SELECT g FROM Game g WHERE LOWER(g.title) LIKE LOWER(CONCAT('%', :title, '%'))")
    List<Game> searchByTitle(@Param("title") String title, Pageable pageable);

    /**
     * Busca juegos por desarrollador
     */
    List<Game> findByDeveloperContainingIgnoreCase(String developer, Pageable pageable);

    /**
     * Busca juegos por publisher
     */
    List<Game> findByPublisherContainingIgnoreCase(String publisher, Pageable pageable);

    /**
     * Busca los juegos más populares (por likes)
     */
    @Query("SELECT g FROM Game g ORDER BY g.likesCount DESC")
    List<Game> findMostPopular(Pageable pageable);

    /**
     * Busca los juegos más guardados
     */
    @Query("SELECT g FROM Game g ORDER BY g.savesCount DESC")
    List<Game> findMostSaved(Pageable pageable);

    /**
     * Busca juegos que lanzan esta semana
     */
    @Query("SELECT g FROM Game g WHERE g.releaseDate BETWEEN :today AND :endOfWeek ORDER BY g.releaseDate ASC")
    List<Game> findReleasingThisWeek(@Param("today") LocalDate today, @Param("endOfWeek") LocalDate endOfWeek);

    /**
     * Verifica si existe un juego con el mismo título
     */
    boolean existsByTitleIgnoreCase(String title);

    /**
     * Cuenta juegos por género
     */
    long countByGenreId(Long genreId);
}