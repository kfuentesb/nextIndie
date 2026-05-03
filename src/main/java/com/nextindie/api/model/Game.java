package com.nextindie.api.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.LinkedHashSet;
import java.util.Set;

@Entity
@Getter @Setter
@Table(name = "games")
public class Game {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Column(nullable = false)
    private String title;

    @Column(length = 2000)
    private String description;
    private String trailerUrl;
    private String imageUrl;
    private String developer;

    @ManyToMany
    @JoinTable(
            name = "game_genres",
            joinColumns = @JoinColumn(name = "game_id"),
            inverseJoinColumns = @JoinColumn(name = "genre_id")
    )
    private Set<Genre> genres = new LinkedHashSet<>();

    @ManyToMany
    @JoinTable(
            name = "game_platforms",
            joinColumns = @JoinColumn(name = "game_id"),
            inverseJoinColumns = @JoinColumn(name = "platform_id")
    )
    private Set<Platform> platforms = new LinkedHashSet<>();

    @ManyToMany(mappedBy = "likedGames")
    private Set<User> likedByUsers = new LinkedHashSet<>();

    @ManyToMany(mappedBy = "savedGames")
    private Set<User> savedByUsers = new LinkedHashSet<>();

    @NotNull
    @Column(nullable = false)
    private LocalDate releaseDate; // Por la idea principal de la WEB será obligatorio de momento

    private LocalDateTime createdAt; // Para llevar registro en la base de datos OPCIONAL

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

}
