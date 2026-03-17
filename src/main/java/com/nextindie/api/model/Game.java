package com.nextindie.api.model;

import com.nextindie.api.model.enums.Genre;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "game", schema = "nextindie") // Nombre de la tabla en MySQL
@Data                  // Genera Getters, Setters, Equals, HashCode y ToString (Lombok)
@NoArgsConstructor    // Constructor vacío obligatorio para JPA
@AllArgsConstructor   // Constructor con todos los campos
public class Game {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_game")
    private Integer idGame;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT") // Mapea específicamente al tipo TEXT
    private String description;

    @Column(columnDefinition = "TEXT")
    private String synopsis;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "genre_id")
    private Genre genre;

    private String developer;
    private String publisher;

    @Column(name = "release_date")
    private LocalDate releaseDate;

    @Column(name = "player_mode")
    private String playerMode;

    @Column(name = "trailer_url", nullable = false)
    private String trailerUrl;

    @Column(name = "thumbnail_url")
    private String thumbnailUrl;

    @Column(name = "website_url")
    private String websiteUrl;

    @Column(name = "steam_url")
    private String steamUrl;

    @Column(name = "likes_count")
    private Integer likesCount = 0;

    @Column(name = "saves_count")
    private Integer savesCount = 0;

    private String status = "PENDING";

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "update_at")
    private LocalDateTime updateAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updateAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updateAt = LocalDateTime.now();
    }

    @Column(name = "fecha_lanzamiento")
    private LocalDate fechaLanzamiento;

    @Column(name = "trailer_url")
    private String trailerUrl;

    @Column(name = "imagen_portada")
    private String imagenPortada;

    @Column(name = "empresa_desarrolladora")
    private String empresaDesarrolladora;

    @CreationTimestamp // Spring rellena esto automáticamente al crear el registro
    @Column(name = "fecha_creacion_registro", updatable = false)
    private LocalDateTime fechaCreacionRegistro;
}