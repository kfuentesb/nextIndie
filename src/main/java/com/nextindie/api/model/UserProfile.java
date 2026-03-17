package com.nextindie.api.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "user_profiles", schema = "nextindie")
public class UserProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", unique = true, nullable = false)
    private Long userId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private User user;

    @Column(columnDefinition = "TEXT")
    private String bio;

    @Column(length = 100)
    private String location;

    @Column(length = 255)
    private String website;

    @Column(name = "twitter_handle", length = 50)
    private String twitterHandle;

    @Column(name = "discord_username", length = 50)
    private String discordUsername;

    @Column(name = "steam_username", length = 50)
    private String steamUsername;

    @Column(name = "favorite_genre_id")
    private Integer favoriteGenreId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "favorite_genre_id", insertable = false, updatable = false)
    private Genre favoriteGenre;

    @Column(name = "total_games_liked")
    private Integer totalGamesLiked = 0;

    @Column(name = "total_games_saved")
    private Integer totalGamesSaved = 0;

    @Column(name = "total_comments")
    private Integer totalComments = 0;

    @Column(name = "total_reviews")
    private Integer totalReviews = 0;

    @Column(name = "reputation_score")
    private Integer reputationScore = 0;

    @Column(name = "is_public")
    private Boolean isPublic = true;

    @Column(name = "show_email")
    private Boolean showEmail = false;

    @Column(name = "show_activity")
    private Boolean showActivity = true;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public UserProfile(Long userId) {
        this.userId = userId;
    }

    // Métodos de utilidad
    public void incrementGamesLiked() {
        this.totalGamesLiked = (this.totalGamesLiked != null ? this.totalGamesLiked : 0) + 1;
    }

    public void decrementGamesLiked() {
        if (this.totalGamesLiked != null && this.totalGamesLiked > 0) {
            this.totalGamesLiked--;
        }
    }

    public void incrementGamesSaved() {
        this.totalGamesSaved = (this.totalGamesSaved != null ? this.totalGamesSaved : 0) + 1;
    }

    public void decrementGamesSaved() {
        if (this.totalGamesSaved != null && this.totalGamesSaved > 0) {
            this.totalGamesSaved--;
        }
    }

    public void incrementComments() {
        this.totalComments = (this.totalComments != null ? this.totalComments : 0) + 1;
    }

    public void incrementReputation(int points) {
        this.reputationScore = (this.reputationScore != null ? this.reputationScore : 0) + points;
    }

    @Override
    public String toString() {
        return "UserProfile{" +
                "id=" + id +
                ", userId=" + userId +
                ", bio='" + bio + '\'' +
                ", location='" + location + '\'' +
                '}';
    }
}