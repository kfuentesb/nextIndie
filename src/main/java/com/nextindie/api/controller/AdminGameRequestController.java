package com.nextindie.api.controller;

import com.nextindie.api.dto.GameRequestResponse;
import com.nextindie.api.model.enums.GameRequestStatus;
import com.nextindie.api.service.GameRequestService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/game-requests")
public class AdminGameRequestController {

    private final GameRequestService gameRequestService;

    public AdminGameRequestController(GameRequestService gameRequestService) {
        this.gameRequestService = gameRequestService;
    }

    @GetMapping
    public ResponseEntity<List<GameRequestResponse>> getRequests(@RequestParam(required = false) String status) {
        GameRequestStatus parsedStatus = null;
        if (status != null && !status.isBlank()) {
            parsedStatus = GameRequestStatus.valueOf(status.toUpperCase());
        }
        return ResponseEntity.ok(gameRequestService.getRequests(parsedStatus));
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<GameRequestResponse> approveRequest(@PathVariable Long id) {
        return ResponseEntity.ok(gameRequestService.approveRequest(id));
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<GameRequestResponse> rejectRequest(@PathVariable Long id) {
        return ResponseEntity.ok(gameRequestService.rejectRequest(id));
    }
}
