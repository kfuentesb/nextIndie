package com.nextindie.api.model.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
public class GameDetailDTO {

    private Long id;
    private String title;
    private String description;
    private String synopsis;
    private String genre;
    private Long genreId;
    private String developer;
    private String publisher;
    private LocalDate releaseDate;
    private String releaseDateFormatted;
    private String playerMode;
    private String playerModeDescription;
    private String trailerUrl;
    private String thumbnailUrl;
    private String coverUrl;
    private String websiteUrl;
    private String steamUrl;
    private String status;

    // Estadísticas
    private Integer likesCount;
    private Integer savesCount;
    private Long commentsCount;

    // Estados de lanzamiento
    private Boolean isReleased;
    private Integer daysUntilRelease;

    // Estados de usuario
    private Boolean savedByCurrentUser;
    private Boolean inWatchlist;
    private Boolean likedByCurrentUser;

    // Juegos relacionados
    private List<GameDTO> relatedGames;


}