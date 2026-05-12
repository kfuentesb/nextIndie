package com.nextindie.api.service;

import com.nextindie.api.dto.AdminUserRequest;
import com.nextindie.api.dto.AdminUserResponse;
import com.nextindie.api.model.User;
import com.nextindie.api.model.enums.UserType;
import com.nextindie.api.repository.CommentRepository;
import com.nextindie.api.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final CommentRepository commentRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, CommentRepository commentRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.commentRepository = commentRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User findByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
    }

    public Page<AdminUserResponse> getUsers(int page, int size) {
        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), 50);
        return userRepository.findAll(PageRequest.of(safePage, safeSize, Sort.by("id").ascending()))
                .map(this::toAdminResponse);
    }

    @Transactional
    public AdminUserResponse createUser(AdminUserRequest request) {
        validateRequiredUserFields(request, true);
        String username = request.getUsername().trim();
        String email = request.getEmail().trim();
        if (userRepository.existsByUsername(username)) {
            throw new RuntimeException("El nombre de usuario ya existe");
        }
        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("El email ya esta registrado");
        }

        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole() != null ? request.getRole() : UserType.NORMAL);

        return toAdminResponse(userRepository.save(user));
    }

    @Transactional
    public AdminUserResponse updateUser(Long id, AdminUserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        validateRequiredUserFields(request, false);
        String username = request.getUsername().trim();
        String email = request.getEmail().trim();
        if (userRepository.existsByUsernameAndIdNot(username, id)) {
            throw new RuntimeException("El nombre de usuario ya existe");
        }
        if (userRepository.existsByEmailAndIdNot(email, id)) {
            throw new RuntimeException("El email ya esta registrado");
        }

        user.setUsername(username);
        user.setEmail(email);
        if (StringUtils.hasText(request.getPassword())) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }
        user.setRole(request.getRole() != null ? request.getRole() : UserType.NORMAL);

        return toAdminResponse(userRepository.save(user));
    }

    @Transactional
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        user.getLikedGames().clear();
        user.getSavedGames().clear();
        commentRepository.deleteByUserId(id);
        userRepository.delete(user);
    }

    private void validateRequiredUserFields(AdminUserRequest request, boolean requirePassword) {
        if (request == null || !StringUtils.hasText(request.getUsername())) {
            throw new RuntimeException("El nombre de usuario es obligatorio");
        }
        if (!StringUtils.hasText(request.getEmail())) {
            throw new RuntimeException("El email es obligatorio");
        }
        if (requirePassword && !StringUtils.hasText(request.getPassword())) {
            throw new RuntimeException("La password es obligatoria");
        }
    }

    private AdminUserResponse toAdminResponse(User user) {
        return new AdminUserResponse(user.getId(), user.getUsername(), user.getEmail(), user.getRole());
    }
}
