package com.nextindie.api.model.dto;

import lombok.Getter;
import lombok.Setter;

/**
 * DTO optimizado para el feed tipo TikTok
 */
@Getter
@Setter
public class GameFeedDTO {

    private Long id;
    private String title;
    private String shortDescription; // Max 100 chars
    private String genre;
    private String genreColor; // Color del badge según género
    private String trailerUrl;
    private String thumbnailUrl;
    private String playerMode; // Icono simple
    private Integer likesCount;
    private Integer savesCount;

    // Estados de UI (no persistidos)
    private Boolean isMuted = true;
    private Boolean isLoaded = false; // Para lazy loading de videos
    private Boolean isVisible = false; // Si está en viewport

}