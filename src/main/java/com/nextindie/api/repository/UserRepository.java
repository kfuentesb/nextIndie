package com.nextindie.api.repository;

import com.nextindie.api.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // Búsqueda por username o email
    Optional<User> findByUsername(String username);

    Optional<User> findByEmail(String email);

    @Query("SELECT u FROM User u WHERE u.username = :usernameOrEmail OR u.email = :usernameOrEmail")
    Optional<User> findByUsernameOrEmail(@Param("usernameOrEmail") String usernameOrEmail);

    // Verificar existencia
    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    // Búsquedas con filtros
    List<User> findByRole(String role);

    List<User> findByIsActive(Boolean isActive);

    @Query("SELECT u FROM User u WHERE u.isActive = true AND u.role = 'USER'")
    List<User> findAllActiveUsers();

    // Búsqueda paginada para administración
    Page<User> findByUsernameContainingIgnoreCase(String search, Pageable pageable);

    // Actualizar último login
    @Modifying
    @Query("UPDATE User u SET u.lastLogin = :loginTime WHERE u.id = :userId")
    void updateLastLogin(@Param("userId") Long userId, @Param("loginTime") LocalDateTime loginTime);

    // Activar/Desactivar usuario
    @Modifying
    @Query("UPDATE User u SET u.isActive = :status WHERE u.id = :userId")
    void updateActiveStatus(@Param("userId") Long userId, @Param("status") Boolean status);

    // Cambiar rol
    @Modifying
    @Query("UPDATE User u SET u.role = :role WHERE u.id = :userId")
    void updateRole(@Param("userId") Long userId, @Param("role") String role);

    // Actualizar avatar
    @Modifying
    @Query("UPDATE User u SET u.avatarUrl = :avatarUrl WHERE u.id = :userId")
    void updateAvatar(@Param("userId") Long userId, @Param("avatarUrl") String avatarUrl);

    // Estadísticas
    @Query("SELECT COUNT(u) FROM User u WHERE u.role = 'USER'")
    Long countRegularUsers();

    @Query("SELECT COUNT(u) FROM User u WHERE u.createdAt >= :since")
    Long countNewUsersSince(@Param("since") LocalDateTime since);

    // Usuarios con actividad reciente
    @Query("SELECT u FROM User u WHERE u.lastLogin >= :since ORDER BY u.lastLogin DESC")
    List<User> findRecentlyActive(@Param("since") LocalDateTime since);

    // Top usuarios por reputación (join con profile)
    @Query("SELECT u FROM User u JOIN UserProfile up ON u.id = up.userId ORDER BY up.reputationScore DESC")
    List<User> findTopUsersByReputation(Pageable pageable);
}