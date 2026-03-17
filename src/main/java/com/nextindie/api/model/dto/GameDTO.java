package com.nextindie.api.model.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
@Getter
@Setter
public class GameDTO {

    private Long id;
    private String title;
    private String description;
    private String shortDescription;
    private String genre;
    private Long genreId;
    private String developer;
    private String publisher;
    private LocalDate releaseDate;
    private String releaseDateFormatted;
    private String playerMode;
    private String playerModeIcon;
    private String trailerUrl;
    private String thumbnailUrl;
    private String coverUrl;
    private String websiteUrl;
    private String steamUrl;

    // Estadísticas
    private Integer likesCount;
    private Integer savesCount;
    private Long commentsCount;

    // Estados de lanzamiento
    private Boolean isReleased;
    private Integer daysUntilRelease;

    // Estados de usuario
    private Boolean likedByCurrentUser;
    private Boolean savedByCurrentUser;

}