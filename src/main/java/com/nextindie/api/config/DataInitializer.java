package com.nextindie.api.config;

import com.nextindie.api.model.User;
import com.nextindie.api.model.enums.UserType;
import com.nextindie.api.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        createUserIfMissing("admin", "admin@nextindie.com", "admin123", UserType.ADMIN);
        createUserIfMissing("moderador", "moderador@nextindie.com", "moderador123", UserType.MODERADOR);
        createUserIfMissing("empresa", "empresa@nextindie.com", "empresa123", UserType.EMPRESA);
        createUserIfMissing("user", "user@nextindie.com", "user123", UserType.NORMAL);

        /*
        TODO (desactivado a petición):
        - seed de géneros/plataformas locales
        - seed de juegos locales
        - sync automático inicial de IGDB
         */
    }

    private void createUserIfMissing(String username, String email, String rawPassword, UserType role) {
        if (userRepository.findByUsername(username).isPresent()) {
            return;
        }
        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(rawPassword));
        user.setRole(role);
        userRepository.save(user);
    }
}
