package com.nextindie.api.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter @Setter
@NoArgsConstructor
@Table(name = "games")
public class Game {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(length = 2000)
    private String description;

    @Column(name = "short_synopsis", length = 1000)
    private String synopsis;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "genre_id")
    private Genre genre;

    private String developer;
    private String publisher;

    @Column(name = "release_date")
    private LocalDate releaseDate;

    @Column(name = "player_mode")
    private String playerMode; // SINGLE_PLAYER, MULTIPLAYER, BOTH

    @Column(name = "trailer_url")
    private String trailerUrl;

    @Column(name = "thumbnail_url")
    private String thumbnailUrl;

    @Column(name = "website_url")
    private String websiteUrl;

    @Column(name = "steam_url")
    private String steamUrl;

    @Column(name = "status")
    private String status; // RELEASED, COMING_SOON, EARLY_ACCESS

    @Column(name = "likes_count")
    private Integer likesCount = 0;

    @Column(name = "saves_count")
    private Integer savesCount = 0;

    @OneToMany(mappedBy = "game", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<GameLike> likes = new ArrayList<>();

    @OneToMany(mappedBy = "game", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<GameSave> savedBy = new ArrayList<>();

}