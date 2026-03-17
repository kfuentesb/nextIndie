package com.nextindie.api.model.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
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
    private String genre;
    private LocalDate releaseDate;

    public GameDTO(Long id, String title, String description, String trailerUrl, String imageUrl,
                   String developer, String genre, LocalDate releaseDate) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.trailerUrl = trailerUrl;
        this.imageUrl = imageUrl;
        this.developer = developer;
        this.genre = genre;
        this.releaseDate = releaseDate;
    }

}