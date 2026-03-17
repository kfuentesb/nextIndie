package com.nextindie.api.controller;

import com.nextindie.api.model.dto.CommentDTO;
import com.nextindie.api.service.CommentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/comments")
@CrossOrigin(origins = "http://localhost:4200")
public class CommentController {

    @Autowired
    private CommentService commentService;

    @GetMapping("/game/{gameId}")
    public ResponseEntity<List<CommentDTO>> getComments(
            @PathVariable Long gameId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @AuthenticationPrincipal UserDetails userDetails) {

        Long userId = userDetails != null ? getUserIdFromUsername(userDetails.getUsername()) : null;
        return ResponseEntity.ok(commentService.getCommentsByGame(gameId, userId, page, size));
    }

    @PostMapping("/game/{gameId}")
    public ResponseEntity<CommentDTO> addComment(
            @PathVariable Long gameId,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserDetails userDetails) {

        Long userId = getUserIdFromUsername(userDetails.getUsername());
        String content = body.get("content");
        String parentIdStr = body.get("parentId");
        Long parentId = parentIdStr != null ? Long.parseLong(parentIdStr) : null;

        return ResponseEntity.ok(commentService.addComment(gameId, userId, content, parentId));
    }

    @DeleteMapping("/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable Long commentId,
            @AuthenticationPrincipal UserDetails userDetails) {

        Long userId = getUserIdFromUsername(userDetails.getUsername());
        commentService.deleteComment(commentId, userId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{commentId}/like")
    public ResponseEntity<Void> toggleLike(
            @PathVariable Long commentId,
            @AuthenticationPrincipal UserDetails userDetails) {

        Long userId = getUserIdFromUsername(userDetails.getUsername());
        commentService.toggleLike(commentId, userId);
        return ResponseEntity.ok().build();
    }

    private Long getUserIdFromUsername(String username) {
        // Implementar conversión o usar JWT claims
        return 1L; // Placeholder
    }
}