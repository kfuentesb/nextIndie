package com.nextindie.api.repository;

import com.nextindie.api.model.Comment;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;


import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {

    // Comentarios principales de un juego (sin respuestas)
    @Query("SELECT c FROM Comment c WHERE c.gameId = :gameId AND c.parentId IS NULL ORDER BY c.createdAt DESC")
    List<Comment> findMainCommentsByGame(@Param("gameId") Long gameId, Pageable pageable);

    // Respuestas a un comentario específico
    List<Comment> findByParentIdOrderByCreatedAtAsc(Long parentId);

    // Contar comentarios de un juego
    Long countByGameId(Long gameId);

    // Comentarios recientes de un usuario
    List<Comment> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
}