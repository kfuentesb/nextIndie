package com.nextindie.api.service;

import com.nextindie.api.model.Game;
import com.nextindie.api.model.dto.GameDTO;
import com.nextindie.api.model.dto.GameDetailDTO;
import com.nextindie.api.repository.CommentRepository;
import com.nextindie.api.repository.GameRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Service
public class GameService {

    @Autowired
    private GameRepository gameRepository;

    @Autowired
    private GameLikeRepository likeRepository;

    @Autowired
    private GameSaveRepository saveRepository;

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private GenreRepository genreRepository;

    // ============ MÉTODOS DE CONVERSIÓN ============

    /**
     * Convierte Game a GameDTO (para listados)
     */
    public GameDTO convertToDTO(Game game, Long currentUserId) {
        if (game == null) return null;

        GameDTO dto = new GameDTO();
        dto.setId(game.getId());
        dto.setTitle(game.getTitle());
        dto.setDescription(game.getDescription());
        dto.setShortDescription(truncate(game.getDescription(), 100));

        // Género
        if (game.getGenre() != null) {
            dto.setGenre(game.getGenre().getName());
            dto.setGenreId(game.getGenre().getId());
        }

        dto.setDeveloper(game.getDeveloper());
        dto.setPublisher(game.getPublisher());
        dto.setReleaseDate(game.getReleaseDate());
        dto.setReleaseDateFormatted(formatReleaseDate(game.getReleaseDate()));
        dto.setPlayerMode(game.getPlayerMode());
        dto.setPlayerModeIcon(getPlayerModeIcon(game.getPlayerMode()));
        dto.setTrailerUrl(game.getTrailerUrl());
        dto.setThumbnailUrl(game.getThumbnailUrl());
        dto.setCoverUrl(game.getThumbnailUrl()); // Usar thumbnail como cover por defecto
        dto.setWebsiteUrl(game.getWebsiteUrl());
        dto.setSteamUrl(game.getSteamUrl());

        // Estadísticas
        dto.setLikesCount(game.getLikesCount());
        dto.setSavesCount(game.getSavesCount());
        dto.setCommentsCount(commentRepository.countByGameId(game.getId()));

        // Fecha de lanzamiento
        LocalDate today = LocalDate.now();
        boolean isReleased = game.getReleaseDate() != null && !game.getReleaseDate().isAfter(today);
        dto.setIsReleased(isReleased);

        if (!isReleased && game.getReleaseDate() != null) {
            long days = ChronoUnit.DAYS.between(today, game.getReleaseDate());
            dto.setDaysUntilRelease((int) days);
        }

        // Estados de usuario
        if (currentUserId != null) {
            dto.setLikedByCurrentUser(likeRepository.existsByUserIdAndGameId(currentUserId, game.getId()));
            dto.setSavedByCurrentUser(saveRepository.existsByUserIdAndGameId(currentUserId, game.getId()));
        }

        return dto;
    }

    /**
     * Convierte Game a GameDetailDTO (para página de detalle)
     */
    public GameDetailDTO convertToDetailDTO(Game game, Long currentUserId) {
        if (game == null) return null;

        GameDetailDTO dto = new GameDetailDTO();

        // Copiar datos básicos
        dto.setId(game.getId());
        dto.setTitle(game.getTitle());
        dto.setDescription(game.getDescription());
        dto.setSynopsis(game.getSynopsis());

        if (game.getGenre() != null) {
            dto.setGenre(game.getGenre().getName());
            dto.setGenreId(game.getGenre().getId());
        }

        dto.setDeveloper(game.getDeveloper());
        dto.setPublisher(game.getPublisher());
        dto.setReleaseDate(game.getReleaseDate());
        dto.setReleaseDateFormatted(formatReleaseDate(game.getReleaseDate()));
        dto.setPlayerMode(game.getPlayerMode());
        dto.setPlayerModeDescription(getPlayerModeDescription(game.getPlayerMode()));
        dto.setTrailerUrl(game.getTrailerUrl());
        dto.setThumbnailUrl(game.getThumbnailUrl());
        dto.setCoverUrl(game.getThumbnailUrl());
        dto.setWebsiteUrl(game.getWebsiteUrl());
        dto.setSteamUrl(game.getSteamUrl());

        // Estadísticas
        dto.setLikesCount(game.getLikesCount());
        dto.setSavesCount(game.getSavesCount());
        dto.setCommentsCount(commentRepository.countByGameId(game.getId()));

        // Fecha
        LocalDate today = LocalDate.now();
        boolean isReleased = game.getReleaseDate() != null && !game.getReleaseDate().isAfter(today);
        dto.setIsReleased(isReleased);
        dto.setStatus(game.getStatus());

        if (!isReleased && game.getReleaseDate() != null) {
            long days = ChronoUnit.DAYS.between(today, game.getReleaseDate());
            dto.setDaysUntilRelease((int) days);
        }

        // Estados de usuario
        if (currentUserId != null) {
            boolean saved = saveRepository.existsByUserIdAndGameId(currentUserId, game.getId());
            dto.setSavedByCurrentUser(saved);
            dto.setInWatchlist(saved);
            dto.setLikedByCurrentUser(likeRepository.existsByUserIdAndGameId(currentUserId, game.getId()));
        }

        // Juegos relacionados (mismo género, excluyendo este)
        if (game.getGenre() != null) {
            List<GameDTO> related = gameRepository
                    .findRelatedGames(game.getGenre().getId(), game.getId(), PageRequest.of(0, 6))
                    .stream()
                    .map(g -> convertToDTO(g, currentUserId))
                    .collect(Collectors.toList());
            dto.setRelatedGames(related);
        }

        return dto;
    }

    /**
     * Convierte Game a GameCalendarDTO (para vista calendario)
     */
    public GameCalendarDTO convertToCalendarDTO(Game game, Long currentUserId, int priority) {
        if (game == null) return null;

        GameCalendarDTO dto = new GameCalendarDTO();
        dto.setId(game.getId());
        dto.setTitle(game.getTitle());
        dto.setThumbnailUrl(game.getThumbnailUrl());

        if (game.getGenre() != null) {
            dto.setGenre(game.getGenre().getName());
        }

        dto.setReleaseDate(game.getReleaseDate());
        dto.setLikesCount(game.getLikesCount());
        dto.setPriority(priority);

        // Formatear fecha
        if (game.getReleaseDate() != null) {
            DateTimeFormatter dayFormatter = DateTimeFormatter.ofPattern("dd");
            DateTimeFormatter monthFormatter = DateTimeFormatter.ofPattern("MMM", new Locale("es", "ES"));
            DateTimeFormatter weekdayFormatter = DateTimeFormatter.ofPattern("EEEE", new Locale("es", "ES"));
            DateTimeFormatter fullFormatter = DateTimeFormatter.ofPattern("d 'de' MMMM 'de' yyyy", new Locale("es", "ES"));

            dto.setDayOfMonth(game.getReleaseDate().format(dayFormatter));
            dto.setMonthShort(game.getReleaseDate().format(monthFormatter).toUpperCase());
            dto.setWeekday(capitalizeFirst(game.getReleaseDate().format(weekdayFormatter)));
            dto.setReleaseDateFormatted(game.getReleaseDate().format(fullFormatter));

            LocalDate today = LocalDate.now();
            boolean isReleased = !game.getReleaseDate().isAfter(today);
            dto.setIsReleased(isReleased);

            if (!isReleased) {
                long days = ChronoUnit.DAYS.between(today, game.getReleaseDate());
                dto.setDaysUntilRelease((int) days);
            }
        }

        // Estados de usuario
        if (currentUserId != null) {
            dto.setIsSaved(saveRepository.existsByUserIdAndGameId(currentUserId, game.getId()));
            dto.setIsLiked(likeRepository.existsByUserIdAndGameId(currentUserId, game.getId()));

            // Verificar notificación
            saveRepository.findByUserIdAndGameId(currentUserId, game.getId())
                    .ifPresent(save -> dto.setNotifyOnRelease(save.getNotifyOnRelease()));
        }

        return dto;
    }

    // ============ MÉTODOS AUXILIARES ============

    private String truncate(String text, int maxLength) {
        if (text == null) return "";
        if (text.length() <= maxLength) return text;
        return text.substring(0, maxLength - 3) + "...";
    }

    private String formatReleaseDate(LocalDate date) {
        if (date == null) return "Próximamente";

        LocalDate today = LocalDate.now();
        if (date.isEqual(today)) return "¡Hoy!";
        if (date.isBefore(today)) return "Disponible";

        long days = ChronoUnit.DAYS.between(today, date);
        if (days == 1) return "Mañana";
        if (days <= 7) return "En " + days + " días";
        if (days <= 30) return "En " + (days / 7) + " semanas";

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd MMM yyyy", new Locale("es", "ES"));
        return date.format(formatter);
    }

    private String getPlayerModeIcon(String mode) {
        return switch (mode) {
            case "SINGLE_PLAYER" -> "🎮";
            case "MULTIPLAYER" -> "👥";
            case "BOTH" -> "🎮👥";
            default -> "🎮";
        };
    }

    private String getPlayerModeDescription(String mode) {
        return switch (mode) {
            case "SINGLE_PLAYER" -> "Un jugador";
            case "MULTIPLAYER" -> "Multijugador";
            case "BOTH" -> "Un jugador / Multijugador";
            default -> "Un jugador";
        };
    }

    private String capitalizeFirst(String text) {
        if (text == null || text.isEmpty()) return text;
        return text.substring(0, 1).toUpperCase() + text.substring(1);
    }
}