package com.nextindie.api.service;

import com.nextindie.api.model.User;
import com.nextindie.api.model.UserProfile;
import com.nextindie.api.model.dto.UpdateProfileRequest;
import com.nextindie.api.model.dto.UserProfileDTO;
import com.nextindie.api.model.dto.UserSummaryDTO;
import com.nextindie.api.repository.UserProfileRepository;
import com.nextindie.api.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserProfileRepository profileRepository;

    @Autowired
    private GenreRepository genreRepository;

    @Autowired
    private GameService gameService;

    // ============ PERFIL PÚBLICO/PRIVADO ============

    @Transactional(readOnly = true)
    public UserProfileDTO getProfileByUsername(String username, boolean isOwnProfile) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado: " + username));

        UserProfile profile = profileRepository.findByUserId(user.getId())
                .orElseGet(() -> createEmptyProfile(user.getId()));

        return convertToProfileDTO(user, profile, isOwnProfile);
    }

    @Transactional(readOnly = true)
    public UserProfileDTO getProfileById(Long userId, boolean isOwnProfile) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        UserProfile profile = profileRepository.findByUserId(userId)
                .orElseGet(() -> createEmptyProfile(userId));

        return convertToProfileDTO(user, profile, isOwnProfile);
    }

    // ============ ACTUALIZACIÓN DE PERFIL ============

    @Transactional
    public UserProfileDTO updateProfile(String username, UpdateProfileRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        UserProfile profile = profileRepository.findByUserId(user.getId())
                .orElseGet(() -> createEmptyProfile(user.getId()));

        // Actualizar campos si no son null
        if (request.getBio() != null) profile.setBio(request.getBio());
        if (request.getLocation() != null) profile.setLocation(request.getLocation());
        if (request.getWebsite() != null) profile.setWebsite(request.getWebsite());
        if (request.getTwitterHandle() != null) profile.setTwitterHandle(request.getTwitterHandle());
        if (request.getDiscordUsername() != null) profile.setDiscordUsername(request.getDiscordUsername());
        if (request.getSteamUsername() != null) profile.setSteamUsername(request.getSteamUsername());
        if (request.getFavoriteGenreId() != null) profile.setFavoriteGenreId(request.getFavoriteGenreId());
        if (request.getIsPublic() != null) profile.setIsPublic(request.getIsPublic());
        if (request.getShowEmail() != null) profile.setShowEmail(request.getShowEmail());
        if (request.getShowActivity() != null) profile.setShowActivity(request.getShowActivity());

        UserProfile saved = profileRepository.save(profile);
        return convertToProfileDTO(user, saved, true);
    }

    @Transactional
    public void updateAvatar(String username, String avatarUrl) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        userRepository.updateAvatar(user.getId(), avatarUrl);
    }

    // ============ ESTADÍSTICAS Y ACTIVIDAD ============

    @Transactional
    public void updateLastLogin(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        userRepository.updateLastLogin(user.getId(), LocalDateTime.now());
    }

    @Transactional
    public void incrementGamesLiked(Long userId) {
        profileRepository.incrementGamesLiked(userId);
        profileRepository.addReputation(userId, 1);
    }

    @Transactional
    public void decrementGamesLiked(Long userId) {
        profileRepository.decrementGamesLiked(userId);
    }

    @Transactional
    public void incrementGamesSaved(Long userId) {
        profileRepository.incrementGamesSaved(userId);
    }

    @Transactional
    public void decrementGamesSaved(Long userId) {
        profileRepository.decrementGamesSaved(userId);
    }

    @Transactional
    public void incrementComments(Long userId) {
        profileRepository.incrementComments(userId);
        profileRepository.addReputation(userId, 2);
    }

    // ============ ADMINISTRACIÓN ============

    @Transactional(readOnly = true)
    public List<UserSummaryDTO> getAllUsers(int page, int size) {
        return userRepository.findAll(PageRequest.of(page, size))
                .getContent()
                .stream()
                .map(this::convertToSummaryDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deactivateUser(Long userId) {
        userRepository.updateActiveStatus(userId, false);
    }

    @Transactional
    public void activateUser(Long userId) {
        userRepository.updateActiveStatus(userId, true);
    }

    @Transactional
    public void changeUserRole(Long userId, String role) {
        userRepository.updateRole(userId, role);
    }

    // ============ MÉTODOS PRIVADOS ============

    private UserProfile createEmptyProfile(Long userId) {
        UserProfile profile = new UserProfile(userId);
        return profileRepository.save(profile);
    }

    private UserProfileDTO convertToProfileDTO(User user, UserProfile profile, boolean isOwnProfile) {
        UserProfileDTO dto = new UserProfileDTO();

        // Info básica
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setAvatarUrl(user.getAvatarUrl());
        dto.setRole(user.getRole());
        dto.setCreatedAt(user.getCreatedAt());
        dto.setLastLogin(user.getLastLogin());
        dto.setIsActive(user.getIsActive());
        dto.setIsOwnProfile(isOwnProfile);

        // Email solo si es propio o si permite mostrarlo
        if (isOwnProfile || (profile.getShowEmail() != null && profile.getShowEmail())) {
            dto.setEmail(user.getEmail());
        }

        // Info del perfil
        dto.setBio(profile.getBio());
        dto.setLocation(profile.getLocation());
        dto.setWebsite(profile.getWebsite());
        dto.setTwitterHandle(profile.getTwitterHandle());
        dto.setDiscordUsername(profile.getDiscordUsername());
        dto.setSteamUsername(profile.getSteamUsername());

        // Género favorito
        if (profile.getFavoriteGenreId() != null) {
            dto.setFavoriteGenreId(profile.getFavoriteGenreId());
            genreRepository.findById(profile.getFavoriteGenreId())
                    .ifPresent(g -> dto.setFavoriteGenre(g.getName()));
        }

        // Estadísticas
        dto.setTotalGamesLiked(profile.getTotalGamesLiked());
        dto.setTotalGamesSaved(profile.getTotalGamesSaved());
        dto.setTotalComments(profile.getTotalComments());
        dto.setTotalReviews(profile.getTotalReviews());
        dto.setReputationScore(profile.getReputationScore());

        // Privacidad
        dto.setIsPublic(profile.getIsPublic());
        dto.setShowEmail(profile.getShowEmail());
        dto.setShowActivity(profile.getShowActivity());

        // Actividad reciente (si es propio o permite ver actividad)
        if (isOwnProfile || (profile.getShowActivity() != null && profile.getShowActivity())) {
            // TODO: Cargar actividad real desde tabla de actividad
            dto.setRecentActivity(List.of());
        }

        return dto;
    }

    private UserSummaryDTO convertToSummaryDTO(User user) {
        // Obtener reputación del perfil si existe
        int reputation = profileRepository.findByUserId(user.getId())
                .map(UserProfile::getReputationScore)
                .orElse(0);

        return new UserSummaryDTO(
                user.getId(),
                user.getUsername(),
                user.getAvatarUrl(),
                user.getRole(),
                reputation
        );
    }
}