package com.nextindie.api.model;

import com.nextindie.api.model.enums.UserType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.LinkedHashSet;
import java.util.Set;

@Entity
@Getter @Setter
@NoArgsConstructor
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @ManyToMany
    @JoinTable(
            name = "user_liked_games",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "game_id"),
            uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "game_id"})
    )
    private Set<Game> likedGames = new LinkedHashSet<>();

    @ManyToMany
    @JoinTable(
            name = "user_saved_games",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "game_id"),
            uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "game_id"})
    )
    private Set<Game> savedGames = new LinkedHashSet<>();

    private LocalDateTime createdAt; // Fecha de registro

    // ROLES.
    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false, length = 50)
    private UserType role;


    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

}
