// service/CommentService.java
package com.nextindie.api.service;

import com.nextindie.api.dto.CommentDTO;
import com.nextindie.api.model.Comment;
import com.nextindie.api.model.Game;
import com.nextindie.api.model.User;
import com.nextindie.api.model.enums.UserType;
import com.nextindie.api.repository.CommentRepository;
import com.nextindie.api.repository.GameRepository;
import com.nextindie.api.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CommentService {

    private final CommentRepository commentRepository;
    private final UserRepository userRepository;
    private final GameRepository gameRepository;

    public CommentService(CommentRepository commentRepository, UserRepository userRepository, GameRepository gameRepository) {
        this.commentRepository = commentRepository;
        this.userRepository = userRepository;
        this.gameRepository = gameRepository;
    }

    public List<CommentDTO> getCommentsByGameId(Long gameId) {
        return commentRepository.findByGameIdOrderByCreatedAtDesc(gameId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public CommentDTO createComment(String content, String username, Long gameId) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Game game = gameRepository.findById(gameId)
                .orElseThrow(() -> new RuntimeException("Juego no encontrado"));

        Comment comment = new Comment();
        comment.setContent(content);
        comment.setUser(user);
        comment.setGame(game);

        Comment saved = commentRepository.save(comment);
        return convertToDTO(saved);
    }

    @Transactional
    public void deleteComment(Long commentId, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comentario no encontrado"));

        if (!canDeleteComment(user, comment.getGame())) {
            throw new RuntimeException("No tienes permisos para borrar este comentario");
        }

        commentRepository.delete(comment);
    }

    private boolean canDeleteComment(User user, Game game) {
        if (user.getRole() == UserType.ADMIN) {
            return true;
        }
        if (user.getRole() == UserType.EMPRESA && game.getRequestedBy() != null) {
            return user.getUsername().equals(game.getRequestedBy().getUsername());
        }
        return false;
    }

    private CommentDTO convertToDTO(Comment comment) {
        return new CommentDTO(
                comment.getId(),
                comment.getContent(),
                comment.getUser().getUsername(),
                comment.getCreatedAt()
        );
    }
}