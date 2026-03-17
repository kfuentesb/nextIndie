package com.nextindie.api.service;

import com.nextindie.api.model.Comment;
import com.nextindie.api.model.dto.CommentDTO;
import com.nextindie.api.repository.CommentRepository;
import com.nextindie.api.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CommentService {

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private CommentLikeRepository commentLikeRepository;

    @Autowired
    private UserRepository userRepository;

    public List<CommentDTO> getCommentsByGame(Long gameId, Long currentUserId, int page, int size) {
        List<Comment> comments = commentRepository.findMainCommentsByGame(
                gameId,
                PageRequest.of(page, size)
        );

        return comments.stream()
                .map(c -> convertToDTO(c, currentUserId))
                .collect(Collectors.toList());
    }

    @Transactional
    public CommentDTO addComment(Long gameId, Long userId, String content, Long parentId) {
        Comment comment = new Comment();
        comment.setGameId(gameId);
        comment.setUserId(userId);
        comment.setContent(content);
        comment.setParentId(parentId);

        Comment saved = commentRepository.save(comment);
        return convertToDTO(saved, userId);
    }

    @Transactional
    public void deleteComment(Long commentId, Long userId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        if (!comment.getUserId().equals(userId)) {
            throw new RuntimeException("Not authorized to delete this comment");
        }

        // Si tiene respuestas, marcar como eliminado en lugar de borrar
        if (comment.getReplies() != null && !comment.getReplies().isEmpty()) {
            comment.setContent("[Comentario eliminado]");
            commentRepository.save(comment);
        } else {
            commentRepository.delete(comment);
        }
    }

    @Transactional
    public void toggleLike(Long commentId, Long userId) {
        if (commentLikeRepository.existsByUserIdAndCommentId(userId, commentId)) {
            commentLikeRepository.deleteByUserIdAndCommentId(userId, commentId);
        } else {
            CommentLike like = new CommentLike();
            like.setUserId(userId);
            like.setCommentId(commentId);
            commentLikeRepository.save(like);
        }
    }

    private CommentDTO convertToDTO(Comment comment, Long currentUserId) {
        CommentDTO dto = new CommentDTO();
        dto.setId(comment.getId());
        dto.setContent(comment.getContent());
        dto.setLikesCount(comment.getLikesCount());
        dto.setIsEdited(comment.getIsEdited());
        dto.setCreatedAt(comment.getCreatedAt());

        // Info del usuario
        userRepository.findById(comment.getUserId()).ifPresent(user -> {
            dto.setUsername(user.getUsername());
            dto.setAvatarUrl(user.getAvatarUrl());
        });

        // Verificar si el usuario actual dio like
        if (currentUserId != null) {
            dto.setLikedByCurrentUser(
                    commentLikeRepository.existsByUserIdAndCommentId(currentUserId, comment.getId())
            );
        }

        // Cargar respuestas (limitado a 3 primeras)
        List<Comment> replies = commentRepository.findByParentIdOrderByCreatedAtAsc(comment.getId());
        if (replies.size() > 3) {
            dto.setRepliesCount(replies.size());
            replies = replies.subList(0, 3);
        }
        dto.setReplies(replies.stream()
                .map(r -> convertToDTO(r, currentUserId))
                .collect(Collectors.toList()));

        return dto;
    }
}