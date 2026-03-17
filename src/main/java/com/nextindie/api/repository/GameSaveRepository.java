package com.nextindie.api.repository;

import com.nextindie.api.model.GameSave;
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
public interface GameSaveRepository extends JpaRepository<GameSave, Long> {

    // Verificar si un usuario guardó un juego
    boolean existsByUserIdAndGameId(Long userId, Long gameId);

    // Encontrar guardado específico
    Optional<GameSave> findByUserIdAndGameId(Long userId, Long gameId);

    // Contar guardados de un juego
    long countByGameId(Long gameId);

    // Obtener todos los juegos guardados por un usuario
    List<GameSave> findByUserId(Long userId);

    // Obtener guardados de un usuario con paginación
    Page<GameSave> findByUserId(Long userId, Pageable pageable);

    // Obtener guardados con notificación activada
    List<GameSave> findByUserIdAndNotifyOnReleaseTrue(Long userId);

    // Obtener todos los guardados que tienen notificación activada para un juego específico
    List<GameSave> findByGameIdAndNotifyOnReleaseTrue(Long gameId);

    // Eliminar guardado
    @Modifying
    @Query("DELETE FROM GameSave gs WHERE gs.user.id = :userId AND gs.game.id = :gameId")
    void deleteByUserIdAndGameId(@Param("userId") Long userId, @Param("gameId") Long gameId);

    // Actualizar estado de notificación
    @Modifying
    @Query("UPDATE GameSave gs SET gs.notifyOnRelease = :notify WHERE gs.user.id = :userId AND gs.game.id = :gameId")
    void updateNotifyOnRelease(@Param("userId") Long userId, @Param("gameId") Long gameId, @Param("notify") boolean notify);

    // Contar guardados por lista de juegos
    @Query("SELECT gs.game.id, COUNT(gs) FROM GameSave gs WHERE gs.game.id IN :gameIds GROUP BY gs.game.id")
    List<Object[]> countSavesByGameIds(@Param("gameIds") List<Long> gameIds);
}