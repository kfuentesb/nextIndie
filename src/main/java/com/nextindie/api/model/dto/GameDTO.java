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
    private String shortDescription; // Versión truncada para cards
    private String genre;
    private Long genreId;
    private String developer;
    private String publisher;
    private LocalDate releaseDate;
    private String releaseDateFormatted; // "15 Jun 2025" o "Próximamente"
    private String playerMode; // SINGLE_PLAYER, MULTIPLAYER, BOTH
    private String playerModeIcon; // 🎮, 👥, 🎮👥
    private String trailerUrl;
    private String thumbnailUrl;
    private String coverUrl; // Imagen más grande para detalle
    private String websiteUrl;
    private String steamUrl;
    private Integer likesCount;
    private Integer savesCount;
    private Integer commentsCount;
    private Boolean isReleased;
    private Integer daysUntilRelease; // Null si ya salió

    // Estados de interacción del usuario actual (null si no está logueado)
    private Boolean likedByCurrentUser;
    private Boolean savedByCurrentUser;

    // Para feed: si el video está muteado, pausado, etc.
    private Boolean isMuted = true;
    private Boolean isPlaying = false;

    // Métodos de utilidad
    public boolean isUpcoming() {
        return isReleased != null && !isReleased;
    }

    @Override
    public String toString() {
        return "GameDTO{" +
                "id=" + id +
                ", title='" + title + '\'' +
                ", genre='" + genre + '\'' +
                ", likesCount=" + likesCount +
                '}';
    }
}