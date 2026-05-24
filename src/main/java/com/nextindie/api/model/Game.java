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
    private String title;

    @Column(unique = true)
    private Long igdbId;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String trailerUrl;

    @Column(columnDefinition = "TEXT")
    private String imageUrl;
    private String developer;
    private String gameStatus;

    @Column(columnDefinition = "TEXT")
    private String websiteUrl;
    private String mainFranchise;

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

    @ElementCollection
    @CollectionTable(name = "game_similar_games", joinColumns = @JoinColumn(name = "game_id"))
    @Column(name = "title")
    private Set<String> similarGames = new LinkedHashSet<>();

    @ManyToOne
    @JoinColumn(name = "requested_by_id")
    private User requestedBy;

    @NotNull
    @Column(nullable = false)
    private LocalDate releaseDate; // Por la idea principal de la WEB será obligatorio de momento

    private LocalDateTime createdAt; // Para llevar registro en la base de datos OPCIONAL

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

}
