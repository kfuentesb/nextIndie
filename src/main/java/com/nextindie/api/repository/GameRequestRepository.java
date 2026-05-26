package com.nextindie.api.repository;

import com.nextindie.api.model.GameRequest;
import com.nextindie.api.model.enums.GameRequestStatus;
import com.nextindie.api.model.enums.GameRequestType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface GameRequestRepository extends JpaRepository<GameRequest, Long> {
    List<GameRequest> findByStatus(GameRequestStatus status);
    boolean existsByPromotedGameIdAndStatus(Long gameId, GameRequestStatus status);
    List<GameRequest> findByStatusAndRequestTypeOrderByReviewedAtDesc(GameRequestStatus status, GameRequestType requestType);
    Optional<GameRequest> findTopByPromotedGameIdAndStatusAndRequestTypeOrderByReviewedAtDesc(
            Long gameId,
            GameRequestStatus status,
            GameRequestType requestType
    );
}
