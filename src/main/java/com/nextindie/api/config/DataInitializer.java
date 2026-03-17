package com.nextindie.api.config;

import com.nextindie.api.model.Game;
import com.nextindie.api.model.User;
import com.nextindie.api.repository.GameRepository;
import com.nextindie.api.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.Arrays;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final GameRepository gameRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository, GameRepository gameRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.gameRepository = gameRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        // Crear usuario admin
        if (userRepository.findByUsername("admin").isEmpty()) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setEmail("admin@nextindie.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            userRepository.save(admin);
        }

        // Crear usuario demo
        if (userRepository.findByUsername("demo").isEmpty()) {
            User demo = new User();
            demo.setUsername("demo");
            demo.setEmail("demo@nextindie.com");
            demo.setPassword(passwordEncoder.encode("demo123"));
            userRepository.save(demo);
        }

        // Crear juegos de ejemplo si no existen
        if (gameRepository.count() == 0) {
            Game[] games = {
                    createGame("Hollow Knight", "Una aventura épica en un reino de insectos en ruinas. Explora cavernas tortuosas, combate contra criaturas corrompidas y haz nuevas amistades con extraños insectos.",
                            "https://www.youtube.com/embed/UAO2urG23S4", "https://cdn.akamai.steamstatic.com/steam/apps/367520/header.jpg",
                            "Team Cherry", "Metroidvania", LocalDate.of(2017, 2, 24)),

                    createGame("Celeste", "Ayuda a Madeline a sobrevivir a sus demonios internos en su viaje hasta la cima de la montaña Celeste, en este juego de plataformas súper ajustado hecho a mano.",
                            "https://www.youtube.com/embed/70d9irlxiB4", "https://cdn.akamai.steamstatic.com/steam/apps/504230/header.jpg",
                            "Maddy Makes Games", "Plataformas", LocalDate.of(2018, 1, 25)),

                    createGame("Hades", "Desafía al dios de los muertos como el príncipe inmortal del Inframundo, en este juego de exploración de mazmorras de ritmo trepidante de los creadores de Bastion y Transistor.",
                            "https://www.youtube.com/embed/91t0ha9x0ME", "https://cdn.akamai.steamstatic.com/steam/apps/1145360/header.jpg",
                            "Supergiant Games", "Roguelike", LocalDate.of(2020, 9, 17)),

                    createGame("Stardew Valley", "Acabas de heredar la vieja parcela agrícola de tu abuelo en Stardew Valley. Decides partir hacia una nueva vida con unas herramientas usadas y algo de dinero.",
                            "https://www.youtube.com/embed/ot7uXNQskhs", "https://cdn.akamai.steamstatic.com/steam/apps/413150/header.jpg",
                            "ConcernedApe", "Simulación", LocalDate.of(2016, 2, 26)),

                    createGame("Cuphead", "Cuphead es un juego de acción clásico estilo 'dispara y corre' que se centra en combates contra jefes. Inspirado en los dibujos animados de los años 30.",
                            "https://www.youtube.com/embed/NN-9SQXoi50", "https://cdn.akamai.steamstatic.com/steam/apps/268910/header.jpg",
                            "Studio MDHR", "Acción", LocalDate.of(2017, 9, 29))
            };

            gameRepository.saveAll(Arrays.asList(games));
        }
    }

    private Game createGame(String title, String description, String trailerUrl, String imageUrl,
                            String developer, String genre, LocalDate releaseDate) {
        Game game = new Game();
        game.setTitle(title);
        game.setDescription(description);
        game.setTrailerUrl(trailerUrl);
        game.setImageUrl(imageUrl);
        game.setDeveloper(developer);
        game.setGenre(genre);
        game.setReleaseDate(releaseDate);
        return game;
    }
}