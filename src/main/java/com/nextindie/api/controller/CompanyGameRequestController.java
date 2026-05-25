package com.nextindie.api.controller;

import com.nextindie.api.dto.GameDTO;
import com.nextindie.api.dto.GameRequestCreateRequest;
import com.nextindie.api.dto.GameRequestResponse;
import com.nextindie.api.dto.GameUpdateRequest;
import com.nextindie.api.service.GameRequestService;
import com.nextindie.api.service.GameService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/company")
public class CompanyGameRequestController {

    private final GameRequestService gameRequestService;
    private final GameService gameService;

    public CompanyGameRequestController(GameRequestService gameRequestService, GameService gameService) {
        this.gameRequestService = gameRequestService;
        this.gameService = gameService;
    }

    @PostMapping("/game-requests")
    public ResponseEntity<GameRequestResponse> createRequest(@RequestBody GameRequestCreateRequest request,
                                                             Authentication authentication) {
        return ResponseEntity.ok(gameRequestService.createRequest(request, authentication.getName()));
    }

    @GetMapping("/games")
    public ResponseEntity<List<GameDTO>> getCompanyGames(Authentication authentication) {
        return ResponseEntity.ok(gameService.getCompanyGames(authentication.getName()));
    }

    @PutMapping("/games/{id}")
    public ResponseEntity<GameDTO> updateCompanyGame(@PathVariable Long id,
                                                     @RequestBody GameUpdateRequest request,
                                                     Authentication authentication) {
        return ResponseEntity.ok(gameService.updateGame(id, request, authentication.getName()));
    }

    @DeleteMapping("/games/{id}")
    public ResponseEntity<Void> deleteCompanyGame(@PathVariable Long id, Authentication authentication) {
        gameService.deleteGame(id, authentication.getName());
        return ResponseEntity.noContent().build();
    }
}
