package com.nextindie.api.controller;

import com.nextindie.api.model.dto.*;
import com.nextindie.api.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:4200")
public class UserController {

    @Autowired
    private UserService userService;

    // ============ PERFIL PROPIO ============

    /**
     * Obtener perfil del usuario autenticado
     * GET /api/users/profile
     */
    @GetMapping("/profile")
    public ResponseEntity<UserProfileDTO> getMyProfile(
            @AuthenticationPrincipal UserDetails userDetails) {

        String username = userDetails.getUsername();
        UserProfileDTO profile = userService.getProfileByUsername(username, true);
        return ResponseEntity.ok(profile);
    }

    /**
     * Actualizar perfil propio
     * PUT /api/users/profile
     */
    @PutMapping("/profile")
    public ResponseEntity<UserProfileDTO> updateMyProfile(
            @Valid @RequestBody UpdateProfileRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        String username = userDetails.getUsername();
        UserProfileDTO updated = userService.updateProfile(username, request);
        return ResponseEntity.ok(updated);
    }

    /**
     * Actualizar avatar
     * POST /api/users/profile/avatar
     */
    @PostMapping("/profile/avatar")
    public ResponseEntity<?> updateAvatar(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal UserDetails userDetails) {

        // TODO: Implementar subida de archivos a S3/Cloudinary
        String avatarUrl = "https://i.pravatar.cc/150?u=" + System.currentTimeMillis();
        userService.updateAvatar(userDetails.getUsername(), avatarUrl);

        return ResponseEntity.ok(Map.of("avatarUrl", avatarUrl));
    }

    // ============ PERFILES PÚBLICOS ============

    /**
     * Obtener perfil de cualquier usuario por username
     * GET /api/users/profile/{username}
     */
    @GetMapping("/profile/{username}")
    public ResponseEntity<UserProfileDTO> getUserProfile(
            @PathVariable String username,
            @AuthenticationPrincipal UserDetails userDetails) {

        boolean isOwnProfile = userDetails != null &&
                userDetails.getUsername().equals(username);

        UserProfileDTO profile = userService.getProfileByUsername(username, isOwnProfile);
        return ResponseEntity.ok(profile);
    }

    /**
     * Obtener resumen de usuario (para listados, menciones, etc.)
     * GET /api/users/{id}/summary
     */
    @GetMapping("/{id}/summary")
    public ResponseEntity<UserSummaryDTO> getUserSummary(@PathVariable Long id) {
        // TODO: Implementar método específico en service
        return ResponseEntity.ok().build();
    }

    // ============ ACTIVIDAD Y ESTADÍSTICAS ============

    /**
     * Obtener actividad reciente del usuario
     * GET /api/users/{id}/activity
     */
    @GetMapping("/{id}/activity")
    public ResponseEntity<?> getUserActivity(
            @PathVariable Long id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @AuthenticationPrincipal UserDetails userDetails) {

        // Verificar permisos
        boolean isOwnProfile = userDetails != null &&
                isCurrentUser(userDetails, id);

        // TODO: Implementar servicio de actividad
        return ResponseEntity.ok().build();
    }

    /**
     * Obtener juegos guardados del usuario
     * GET /api/users/{id}/saved-games
     */
    @GetMapping("/{id}/saved-games")
    public ResponseEntity<List<GameDTO>> getSavedGames(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {

        // Solo el propio usuario o admin puede ver esto
        if (!isCurrentUser(userDetails, id) && !isAdmin(userDetails)) {
            return ResponseEntity.status(403).build();
        }

        // TODO: Implementar en GameService
        return ResponseEntity.ok().build();
    }

    /**
     * Obtener juegos favoritos del usuario
     * GET /api/users/{id}/liked-games
     */
    @GetMapping("/{id}/liked-games")
    public ResponseEntity<List<GameDTO>> getLikedGames(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {

        // Verificar privacidad del perfil
        // TODO: Implementar
        return ResponseEntity.ok().build();
    }

    // ============ ADMINISTRACIÓN ============

    /**
     * Listar todos los usuarios (solo admin)
     * GET /api/users/admin/all
     */
    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserSummaryDTO>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        List<UserSummaryDTO> users = userService.getAllUsers(page, size);
        return ResponseEntity.ok(users);
    }

    /**
     * Desactivar usuario (solo admin)
     * POST /api/users/admin/{id}/deactivate
     */
    @PostMapping("/admin/{id}/deactivate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deactivateUser(@PathVariable Long id) {
        userService.deactivateUser(id);
        return ResponseEntity.ok().build();
    }

    /**
     * Activar usuario (solo admin)
     * POST /api/users/admin/{id}/activate
     */
    @PostMapping("/admin/{id}/activate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> activateUser(@PathVariable Long id) {
        userService.activateUser(id);
        return ResponseEntity.ok().build();
    }

    /**
     * Cambiar rol de usuario (solo admin)
     * PUT /api/users/admin/{id}/role
     */
    @PutMapping("/admin/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> changeUserRole(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {

        String role = body.get("role");
        userService.changeUserRole(id, role);
        return ResponseEntity.ok().build();
    }

    // ============ MÉTODOS AUXILIARES ============

    private boolean isCurrentUser(UserDetails userDetails, Long userId) {
        // TODO: Implementar comparación por ID en lugar de username
        return false;
    }

    private boolean isAdmin(UserDetails userDetails) {
        return userDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
    }
}