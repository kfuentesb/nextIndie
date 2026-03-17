package com.nextindie.api.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter @Setter
public class CreateGameRequest {

    @NotBlank(message = "El título es obligatorio")
    @Size(min = 2, max = 100, message = "El título debe tener entre 2 y 100 caracteres")
    private String title;

    @NotBlank(message = "La descripción es obligatoria")
    @Size(min = 10, max = 500, message = "La descripción debe tener entre 10 y 500 caracteres")
    private String description;

    @Size(max = 2000, message = "La sinopsis no puede exceder 2000 caracteres")
    private String synopsis;

    @NotNull(message = "El género es obligatorio")
    private Long genreId;

    @NotBlank(message = "El desarrollador es obligatorio")
    @Size(max = 100)
    private String developer;

    @Size(max = 100)
    private String publisher;

    private LocalDate releaseDate;

    @NotBlank(message = "El modo de juego es obligatorio")
    private String playerMode; // SINGLE_PLAYER, MULTIPLAYER, BOTH

    @NotBlank(message = "La URL del trailer es obligatoria")
    private String trailerUrl;

    private String thumbnailUrl;
    private String coverUrl;
    private String websiteUrl;
    private String steamUrl;
    private String gogUrl;
    private String epicUrl;
    private String itchIoUrl;

}