// service/CommentService.java
package com.nextindie.api.service;

import com.nextindie.api.model.dto.CommentDTO;
import com.nextindie.api.model.Comment;
import com.nextindie.api.model.Game;
import com.nextindie.api.model.User;
import com.nextindie.api.repository.CommentRepository;
import com.nextindie.api.repository.GameRepository;
import com.nextindie.api.repository.UserRepository;
import org.springframework.stereotype.Service;

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

    private CommentDTO convertToDTO(Comment comment) {
        return new CommentDTO(
                comment.getId(),
                comment.getContent(),
                comment.getUser().getUsername(),
                comment.getCreatedAt()
        );
    }
}