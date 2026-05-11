package com.nextindie.api.controller;

import com.nextindie.api.dto.CommentDTO;
import com.nextindie.api.service.CommentService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/comments")
public class CommentController {

    private final CommentService commentService;

    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    }

    @GetMapping("/game/{gameId}")
    public ResponseEntity<List<CommentDTO>> getCommentsByGame(@PathVariable Long gameId) {
        return ResponseEntity.ok(commentService.getCommentsByGameId(gameId));
    }

    @PostMapping("/game/{gameId}")
    public ResponseEntity<CommentDTO> createComment(
            @PathVariable Long gameId,
            @RequestBody Map<String, String> request,
            Authentication authentication) {

        String content = request.get("content");
        String username = authentication.getName();

        return ResponseEntity.ok(commentService.createComment(content, username, gameId));
    }
}
