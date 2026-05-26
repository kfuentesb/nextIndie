package com.nextindie.api.service;

import com.nextindie.api.dto.GameRequestCreateRequest;
import com.nextindie.api.dto.GameRequestResponse;
import com.nextindie.api.model.Game;
import com.nextindie.api.model.GameRequest;
import com.nextindie.api.model.Genre;
import com.nextindie.api.model.Platform;
import com.nextindie.api.model.User;
import com.nextindie.api.model.enums.GameRequestStatus;
import com.nextindie.api.model.enums.GameRequestType;
import com.nextindie.api.model.enums.UserType;
import com.nextindie.api.repository.GameRepository;
import com.nextindie.api.repository.GameRequestRepository;
import com.nextindie.api.repository.GenreRepository;
import com.nextindie.api.repository.PlatformRepository;
import com.nextindie.api.repository.UserRepository;
import com.nextindie.api.util.PromotionPolicy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class GameRequestService {

    private final GameRequestRepository gameRequestRepository;
    private final GameRepository gameRepository;
    private final GenreRepository genreRepository;
    private final PlatformRepository platformRepository;
    private final UserRepository userRepository;

    public GameRequestService(GameRequestRepository gameRequestRepository,
                              GameRepository gameRepository,
                              GenreRepository genreRepository,
                              PlatformRepository platformRepository,
                              UserRepository userRepository) {
        this.gameRequestRepository = gameRequestRepository;
        this.gameRepository = gameRepository;
        this.genreRepository = genreRepository;
        this.platformRepository = platformRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public GameRequestResponse createRequest(GameRequestCreateRequest request, String username) {
        validateRequest(request);
        User requester = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        List<Long> genreIds = request.getGenreIds();
        List<Long> platformIds = request.getPlatformIds();

        List<Genre> genres = genreRepository.findAllById(genreIds);
        if (genres.size() != genreIds.size()) {
            throw new RuntimeException("Generos invalidos");
        }

        List<Platform> platforms = platformRepository.findAllById(platformIds);
        if (platforms.size() != platformIds.size()) {
            throw new RuntimeException("Plataformas invalidas");
        }

        Set<Game> similarGames = new LinkedHashSet<>();
        if (request.getSimilarGameIds() != null && !request.getSimilarGameIds().isEmpty()) {
            List<Game> selectedGames = gameRepository.findAllById(request.getSimilarGameIds());
            similarGames.addAll(selectedGames);
        }

        GameRequest gameRequest = new GameRequest();
        gameRequest.setTitle(request.getTitle().trim());
        gameRequest.setDescription(request.getDescription().trim());
        gameRequest.setTrailerUrl(request.getTrailerUrl().trim());
        gameRequest.setDeveloper(request.getDeveloper().trim());
        gameRequest.setGameStatus(request.getGameStatus().trim());
        gameRequest.setWebsiteUrl(request.getWebsiteUrl().trim());
        gameRequest.setMainFranchise(request.getMainFranchise().trim());
        gameRequest.setReleaseDate(request.getReleaseDate());
        gameRequest.setImageUrl(StringUtils.hasText(request.getImageUrl()) ? request.getImageUrl().trim() : null);
        gameRequest.setRequestedBy(requester);
        gameRequest.setRequestType(GameRequestType.NEW_GAME);
        gameRequest.setStatus(GameRequestStatus.PENDING);
        gameRequest.getGenres().addAll(genres);
        gameRequest.getPlatforms().addAll(platforms);
        gameRequest.getSimilarGames().addAll(similarGames);

        return toResponse(gameRequestRepository.save(gameRequest));
    }

    @Transactional
    public GameRequestResponse createPromotionRequest(Long gameId, String username) {
        User requester = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        Game game = gameRepository.findById(gameId)
                .orElseThrow(() -> new RuntimeException("Juego no encontrado"));

        ensureCanPromoteGame(requester, game);

        if (gameRequestRepository.existsByPromotedGameIdAndStatus(gameId, GameRequestStatus.PENDING)) {
            throw new RuntimeException("Ya existe una solicitud de promocion pendiente");
        }
        GameRequest lastPromoted = gameRequestRepository
                .findTopByPromotedGameIdAndStatusAndRequestTypeOrderByReviewedAtDesc(
                        gameId,
                        GameRequestStatus.PROMOTED,
                        GameRequestType.PROMOTION
                )
                .orElse(null);
        if (lastPromoted != null && PromotionPolicy.isPromotionActive(lastPromoted.getReviewedAt())) {
            throw new RuntimeException("El juego ya esta promocionado");
        }

        GameRequest gameRequest = new GameRequest();
        gameRequest.setTitle(game.getTitle());
        gameRequest.setDescription(game.getDescription());
        gameRequest.setTrailerUrl(game.getTrailerUrl());
        gameRequest.setDeveloper(game.getDeveloper());
        gameRequest.setGameStatus(game.getGameStatus());
        gameRequest.setWebsiteUrl(game.getWebsiteUrl());
        gameRequest.setMainFranchise(game.getMainFranchise());
        gameRequest.setReleaseDate(game.getReleaseDate());
        gameRequest.setImageUrl(game.getImageUrl());
        gameRequest.setRequestedBy(requester);
        gameRequest.setPromotedGame(game);
        gameRequest.setRequestType(GameRequestType.PROMOTION);
        gameRequest.setStatus(GameRequestStatus.PENDING);
        gameRequest.getGenres().addAll(game.getGenres());
        gameRequest.getPlatforms().addAll(game.getPlatforms());

        return toResponse(gameRequestRepository.save(gameRequest));
    }

    public List<GameRequestResponse> getRequests(GameRequestStatus status) {
        List<GameRequest> requests = status == null
                ? gameRequestRepository.findAll()
                : gameRequestRepository.findByStatus(status);
        return requests.stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public GameRequestResponse approveRequest(Long requestId) {
        GameRequest request = gameRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Solicitud no encontrada"));
        if (request.getStatus() != GameRequestStatus.PENDING) {
            throw new RuntimeException("La solicitud ya fue procesada");
        }
        GameRequestType requestType = resolveRequestType(request);
        if (requestType == GameRequestType.PROMOTION) {
            request.setStatus(GameRequestStatus.PROMOTED);
            request.setReviewedAt(LocalDateTime.now());
            return toResponse(gameRequestRepository.save(request));
        }
        if (gameRepository.findByTitleAndReleaseDate(request.getTitle(), request.getReleaseDate()).isPresent()) {
            throw new RuntimeException("Ya existe un juego con ese titulo y fecha");
        }

        Game game = new Game();
        game.setTitle(request.getTitle());
        game.setDescription(request.getDescription());
        game.setTrailerUrl(request.getTrailerUrl());
        game.setDeveloper(request.getDeveloper());
        game.setGameStatus(request.getGameStatus());
        game.setWebsiteUrl(request.getWebsiteUrl());
        game.setMainFranchise(request.getMainFranchise());
        game.setReleaseDate(request.getReleaseDate());
        game.setImageUrl(request.getImageUrl());
        game.setRequestedBy(request.getRequestedBy());
        game.getGenres().addAll(request.getGenres());
        game.getPlatforms().addAll(request.getPlatforms());
        game.getSimilarGames().addAll(
                request.getSimilarGames().stream()
                        .map(Game::getTitle)
                        .collect(Collectors.toCollection(LinkedHashSet::new))
        );

        gameRepository.save(game);

        if (request.getRequestType() == null) {
            request.setRequestType(GameRequestType.NEW_GAME);
        }
        request.setStatus(GameRequestStatus.APPROVED);
        request.setReviewedAt(LocalDateTime.now());
        return toResponse(gameRequestRepository.save(request));
    }

    @Transactional
    public GameRequestResponse rejectRequest(Long requestId) {
        GameRequest request = gameRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Solicitud no encontrada"));
        if (request.getStatus() != GameRequestStatus.PENDING) {
            throw new RuntimeException("La solicitud ya fue procesada");
        }
        request.setStatus(GameRequestStatus.REJECTED);
        request.setReviewedAt(LocalDateTime.now());
        return toResponse(gameRequestRepository.save(request));
    }

    private void validateRequest(GameRequestCreateRequest request) {
        if (request == null) {
            throw new RuntimeException("Solicitud invalida");
        }
        if (!StringUtils.hasText(request.getTitle())) {
            throw new RuntimeException("El titulo es obligatorio");
        }
        if (!StringUtils.hasText(request.getDescription())) {
            throw new RuntimeException("La descripcion es obligatoria");
        }
        if (!StringUtils.hasText(request.getTrailerUrl())) {
            throw new RuntimeException("El trailer es obligatorio");
        }
        if (!StringUtils.hasText(request.getDeveloper())) {
            throw new RuntimeException("La desarrolladora es obligatoria");
        }
        if (!StringUtils.hasText(request.getGameStatus())) {
            throw new RuntimeException("El estado es obligatorio");
        }
        if (!StringUtils.hasText(request.getWebsiteUrl())) {
            throw new RuntimeException("El sitio web es obligatorio");
        }
        if (!StringUtils.hasText(request.getMainFranchise())) {
            throw new RuntimeException("La franquicia es obligatoria");
        }
        if (request.getReleaseDate() == null) {
            throw new RuntimeException("La fecha de lanzamiento es obligatoria");
        }
        if (request.getGenreIds() == null || request.getGenreIds().isEmpty()) {
            throw new RuntimeException("Debes seleccionar al menos un genero");
        }
        if (request.getPlatformIds() == null || request.getPlatformIds().isEmpty()) {
            throw new RuntimeException("Debes seleccionar al menos una plataforma");
        }
    }

    private GameRequestResponse toResponse(GameRequest request) {
        List<String> genres = request.getGenres().stream()
                .map(Genre::getName)
                .sorted()
                .collect(Collectors.toList());
        List<String> platforms = request.getPlatforms().stream()
                .map(Platform::getName)
                .sorted()
                .collect(Collectors.toList());
        List<String> similarGames = request.getSimilarGames().stream()
                .map(Game::getTitle)
                .sorted()
                .collect(Collectors.toList());

        return new GameRequestResponse(
                request.getId(),
                request.getTitle(),
                request.getDescription(),
                request.getTrailerUrl(),
                request.getDeveloper(),
                request.getGameStatus(),
                request.getWebsiteUrl(),
                request.getMainFranchise(),
                request.getReleaseDate(),
                request.getImageUrl(),
                request.getStatus().name(),
                resolveRequestType(request).name(),
                request.getRequestedBy().getUsername(),
                request.getCreatedAt(),
                request.getReviewedAt(),
                genres,
                platforms,
                similarGames
        );
    }

    private void ensureCanPromoteGame(User user, Game game) {
        if (user.getRole() == UserType.ADMIN) {
            return;
        }
        if (user.getRole() == UserType.EMPRESA && game.getRequestedBy() != null) {
            String owner = game.getRequestedBy().getUsername();
            if (user.getUsername().equals(owner)) {
                return;
            }
        }
        throw new RuntimeException("No tienes permisos para promocionar este juego");
    }

    private GameRequestType resolveRequestType(GameRequest request) {
        return request.getRequestType() != null ? request.getRequestType() : GameRequestType.NEW_GAME;
    }

}
