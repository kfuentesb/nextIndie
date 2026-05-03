// model/dto/CommentDTO.java
package com.nextindie.api.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
@Getter
@Setter @NoArgsConstructor
public class CommentDTO {
    private Long id;
    private String content;
    private String username;
    private LocalDateTime createdAt;

    public CommentDTO(Long id, String content, String username, LocalDateTime createdAt) {
        this.id = id;
        this.content = content;
        this.username = username;
        this.createdAt = createdAt;
    }
}