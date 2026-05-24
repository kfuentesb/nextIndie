package com.nextindie.api.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class GameRequestResponse {
    private Long id;
    private String title;
    private String description;
    private String trailerUrl;
    private String developer;
    private String gameStatus;
    private String websiteUrl;
    private String mainFranchise;
    private LocalDate releaseDate;
    private String imageUrl;
    private String status;
    private String requestedBy;
    private LocalDateTime createdAt;
    private LocalDateTime reviewedAt;
    private List<String> genres;
    private List<String> platforms;
    private List<String> similarGames;
}
