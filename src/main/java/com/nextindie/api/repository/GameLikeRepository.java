package com.nextindie.api.repository;

import com.nextindie.api.model.GameLike;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GameLikeRepository extends JpaRepository<GameLike, Long> {

    // Verificar si un usuario dio like a un juego
    boolean existsByUserIdAndGameId(Long userId, Long gameId);

    // Encontrar like específico
    Optional<GameLike> findByUserIdAndGameId(Long userId, Long gameId);

    // Contar likes de un juego
    long countByGameId(Long gameId);

    // Obtener todos los likes de un usuario
    List<GameLike> findByUserId(Long userId);

    // Obtener likes de un usuario con paginación
    Page<GameLike> findByUserId(Long userId, Pageable pageable);

    // Obtener likes de un juego
    List<GameLike> findByGameId(Long gameId);

    // Eliminar like
    @Modifying
    @Query("DELETE FROM GameLike gl WHERE gl.user.id = :userId AND gl.game.id = :gameId")
    void deleteByUserIdAndGameId(@Param("userId") Long userId, @Param("gameId") Long gameId);

    // Contar likes por lista de juegos
    @Query("SELECT gl.game.id, COUNT(gl) FROM GameLike gl WHERE gl.game.id IN :gameIds GROUP BY gl.game.id")
    List<Object[]> countLikesByGameIds(@Param("gameIds") List<Long> gameIds);
}