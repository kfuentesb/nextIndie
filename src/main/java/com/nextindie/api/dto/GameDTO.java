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
    private List<String> genres;
    private List<String> platforms;
    private LocalDate releaseDate;

    public GameDTO(Long id, String title, String description, String trailerUrl, String imageUrl,
                   String developer, List<String> genres, List<String> platforms, LocalDate releaseDate) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.trailerUrl = trailerUrl;
        this.imageUrl = imageUrl;
        this.developer = developer;
        this.genres = genres;
        this.platforms = platforms;
        this.releaseDate = releaseDate;
    }

}
