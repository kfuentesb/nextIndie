package com.nextindie.api.repository;

import com.nextindie.api.model.UserProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserProfileRepository extends JpaRepository<UserProfile, Long> {

    Optional<UserProfile> findByUserId(Long userId);

    boolean existsByUserId(Long userId);

    // Actualizar estadísticas
    @Modifying
    @Query("UPDATE UserProfile up SET up.totalGamesLiked = up.totalGamesLiked + 1 WHERE up.userId = :userId")
    void incrementGamesLiked(@Param("userId") Long userId);

    @Modifying
    @Query("UPDATE UserProfile up SET up.totalGamesLiked = CASE WHEN up.totalGamesLiked > 0 THEN up.totalGamesLiked - 1 ELSE 0 END WHERE up.userId = :userId")
    void decrementGamesLiked(@Param("userId") Long userId);

    @Modifying
    @Query("UPDATE UserProfile up SET up.totalGamesSaved = up.totalGamesSaved + 1 WHERE up.userId = :userId")
    void incrementGamesSaved(@Param("userId") Long userId);

    @Modifying
    @Query("UPDATE UserProfile up SET up.totalGamesSaved = CASE WHEN up.totalGamesSaved > 0 THEN up.totalGamesSaved - 1 ELSE 0 END WHERE up.userId = :userId")
    void decrementGamesSaved(@Param("userId") Long userId);

    @Modifying
    @Query("UPDATE UserProfile up SET up.totalComments = up.totalComments + 1 WHERE up.userId = :userId")
    void incrementComments(@Param("userId") Long userId);

    @Modifying
    @Query("UPDATE UserProfile up SET up.reputationScore = up.reputationScore + :points WHERE up.userId = :userId")
    void addReputation(@Param("userId") Long userId, @Param("points") int points);

    // Buscar por género favorito
    @Query("SELECT up FROM UserProfile up WHERE up.favoriteGenreId = :genreId")
    java.util.List<UserProfile> findByFavoriteGenre(@Param("genreId") Integer genreId);

    // Perfiles públicos
    @Query("SELECT up FROM UserProfile up WHERE up.isPublic = true")
    java.util.List<UserProfile> findPublicProfiles();
}