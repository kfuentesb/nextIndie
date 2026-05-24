package com.nextindie.api.model;

import com.nextindie.api.model.enums.GameRequestStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.LinkedHashSet;
import java.util.Set;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "game_requests")
public class GameRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String trailerUrl;

    @Column(columnDefinition = "TEXT")
    private String websiteUrl;

    @Column(columnDefinition = "TEXT")
    private String imageUrl;

    private String developer;
    private String gameStatus;
    private String mainFranchise;

    @NotNull
    @Column(nullable = false)
    private LocalDate releaseDate;

    @ManyToMany
    @JoinTable(
            name = "game_request_genres",
            joinColumns = @JoinColumn(name = "game_request_id"),
            inverseJoinColumns = @JoinColumn(name = "genre_id")
    )
    private Set<Genre> genres = new LinkedHashSet<>();

    @ManyToMany
    @JoinTable(
            name = "game_request_platforms",
            joinColumns = @JoinColumn(name = "game_request_id"),
            inverseJoinColumns = @JoinColumn(name = "platform_id")
    )
    private Set<Platform> platforms = new LinkedHashSet<>();

    @ManyToMany
    @JoinTable(
            name = "game_request_similar_games",
            joinColumns = @JoinColumn(name = "game_request_id"),
            inverseJoinColumns = @JoinColumn(name = "game_id")
    )
    private Set<Game> similarGames = new LinkedHashSet<>();

    @ManyToOne(optional = false)
    @JoinColumn(name = "requested_by_id", nullable = false)
    private User requestedBy;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private GameRequestStatus status;

    private LocalDateTime createdAt;
    private LocalDateTime reviewedAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
