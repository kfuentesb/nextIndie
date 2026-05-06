package com.nextindie.api.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;
@Getter
@Setter
@NoArgsConstructor
public class GameDTO {
    private Long id;
    private String title;
    private String description;
    private String trailerUrl;
    private String imageUrl;
    private String developer;
    private String gameStatus;
    private String websiteUrl;
    private String mainFranchise;
    private List<String> genres;
    private List<String> platforms;
    private List<String> similarGames;
    private List<String> dlcs;
    private long totalLikes;
    private LocalDate releaseDate;

    public GameDTO(Long id, String title, String description, String trailerUrl, String imageUrl,
                   String developer, String gameStatus, String websiteUrl, String mainFranchise,
                   List<String> genres, List<String> platforms, List<String> similarGames, List<String> dlcs,
                   long totalLikes, LocalDate releaseDate) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.trailerUrl = trailerUrl;
        this.imageUrl = imageUrl;
        this.developer = developer;
        this.gameStatus = gameStatus;
        this.websiteUrl = websiteUrl;
        this.mainFranchise = mainFranchise;
        this.genres = genres;
        this.platforms = platforms;
        this.similarGames = similarGames;
        this.dlcs = dlcs;
        this.totalLikes = totalLikes;
        this.releaseDate = releaseDate;
    }

}
