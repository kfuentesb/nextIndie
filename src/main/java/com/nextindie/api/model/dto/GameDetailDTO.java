package com.nextindie.api.model.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Getter @Setter @NoArgsConstructor
public class GameDetailDTO {

    // Información básica (heredada de GameDTO)
    private Long id;
    private String title;
    private String description;
    private String synopsis; // Sinopsis larga para detalle
    private String genre;
    private Long genreId;
    private String developer;
    private String publisher;
    private LocalDate releaseDate;
    private String releaseDateFormatted;
    private String playerMode;
    private String playerModeDescription; // "Juego de un jugador", "Multijugador online", etc.
    private String trailerUrl;
    private String thumbnailUrl;
    private String coverUrl;
    private List<String> screenshotUrls; // Galería de imágenes
    private String websiteUrl;
    private String steamUrl;
    private String gogUrl;
    private String epicUrl;
    private String itchIoUrl;

    // Estadísticas
    private Integer likesCount;
    private Integer savesCount;
    private Integer commentsCount;
    private Double averageRating; // Cuando implementes reviews
    private Integer totalReviews;

    // Estados de interacción
    private Boolean likedByCurrentUser;
    private Boolean savedByCurrentUser;
    private Boolean inWatchlist; // Alias para saved

    // Contenido relacionado
    private List<GameDTO> relatedGames; // Mismo género
    private List<GameDTO> moreFromDeveloper;
    private List<CommentDTO> recentComments;

    // Metadatos
    private Boolean isReleased;
    private Integer daysUntilRelease;
    private String status; // PENDING, APPROVED, REJECTED (para admin)
    private LocalDate createdAt;
    private String submittedBy; // Username del que registró el juego

    // Métodos de utilidad
    public boolean hasStoreLinks() {
        return steamUrl != null || gogUrl != null || epicUrl != null || itchIoUrl != null;
    }

    @Override
    public String toString() {
        return "GameDetailDTO{" +
                "id=" + id +
                ", title='" + title + '\'' +
                ", genre='" + genre + '\'' +
                ", likesCount=" + likesCount +
                ", relatedGames=" + (relatedGames != null ? relatedGames.size() : 0) +
                '}';
    }
}