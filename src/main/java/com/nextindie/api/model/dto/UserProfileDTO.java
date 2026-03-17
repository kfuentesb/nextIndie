package com.nextindie.api.model.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class UserProfileDTO {

    // Información básica del usuario
    private Long id;
    private String username;
    private String email;
    private String avatarUrl;
    private String role;
    private LocalDateTime createdAt;
    private LocalDateTime lastLogin;
    private Boolean isActive;

    // Información del perfil
    private String bio;
    private String location;
    private String website;
    private String twitterHandle;
    private String discordUsername;
    private String steamUsername;
    private String favoriteGenre;
    private Integer favoriteGenreId;

    // Estadísticas
    private Integer totalGamesLiked;
    private Integer totalGamesSaved;
    private Integer totalComments;
    private Integer totalReviews;
    private Integer reputationScore;

    // Configuración de privacidad
    private Boolean isPublic;
    private Boolean showEmail;
    private Boolean showActivity;
    private Boolean isOwnProfile;

    // Actividad reciente
    private List<ActivityDTO> recentActivity;
    private List<GameDTO> savedGames;
    private List<GameDTO> likedGames;
    private List<CommentDTO> recentComments;

    // Clase interna para actividad
    public static class ActivityDTO {
        private String type; // LIKE, SAVE, COMMENT, REVIEW
        private String description;
        private LocalDateTime timestamp;
        private Long gameId;
        private String gameTitle;
        private String gameThumbnail;

    }
}