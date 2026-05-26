package com.nextindie.api.repository;

import com.nextindie.api.model.GameRequest;
import com.nextindie.api.model.enums.GameRequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GameRequestRepository extends JpaRepository<GameRequest, Long> {
    List<GameRequest> findByStatus(GameRequestStatus status);
    boolean existsByPromotedGameIdAndStatus(Long gameId, GameRequestStatus status);
}
