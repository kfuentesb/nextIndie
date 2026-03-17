package com.nextindie.api.model.dto;

import java.time.LocalDateTime;
import java.util.List;

public class CommentDTO {
    private Long id;
    private String content;
    private String username;
    private String avatarUrl;
    private Integer likesCount;
    private Boolean likedByCurrentUser;
    private Boolean isEdited;
    private LocalDateTime createdAt;
    private List<CommentDTO> replies;
    private Integer repliesCount;

}