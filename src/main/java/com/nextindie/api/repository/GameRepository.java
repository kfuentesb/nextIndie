package com.nextindie.api.repository;

import com.nextindie.api.model.Game;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface GameRepository extends JpaRepository<Game, Long> {
    Optional<Game> findByIgdbId(Long igdbId);
    Optional<Game> findByTitleAndReleaseDate(String title, LocalDate releaseDate);
    List<Game> findByReleaseDateBetweenOrderByReleaseDateAsc(LocalDate startDate, LocalDate endDate);
}
