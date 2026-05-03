package com.nextindie.api.repository;

import com.nextindie.api.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);

    @Query("select count(u) > 0 from User u join u.likedGames g where u.username = :username and g.id = :gameId")
    boolean hasLikedGame(String username, Long gameId);

    @Query("select count(u) from User u join u.likedGames g where g.id = :gameId")
    long countLikesByGameId(Long gameId);

    @Query("select g from User u join u.savedGames g where u.username = :username")
    List<com.nextindie.api.model.Game> findSavedGamesByUsername(String username);
}
