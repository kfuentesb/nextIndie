package com.nextindie.api.config;

import com.nextindie.api.model.Genre;
import com.nextindie.api.model.Game;
import com.nextindie.api.model.Platform;
import com.nextindie.api.model.User;
import com.nextindie.api.repository.GenreRepository;
import com.nextindie.api.repository.GameRepository;
import com.nextindie.api.repository.PlatformRepository;
import com.nextindie.api.repository.UserRepository;
import com.nextindie.api.service.RawgSyncService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final GameRepository gameRepository;
    private final GenreRepository genreRepository;
    private final PlatformRepository platformRepository;
    private final PasswordEncoder passwordEncoder;
    private final RawgSyncService rawgSyncService;

    public DataInitializer(UserRepository userRepository, GameRepository gameRepository,
                           GenreRepository genreRepository, PlatformRepository platformRepository,
                           PasswordEncoder passwordEncoder, RawgSyncService rawgSyncService) {
        this.userRepository = userRepository;
        this.gameRepository = gameRepository;
        this.genreRepository = genreRepository;
        this.platformRepository = platformRepository;
        this.passwordEncoder = passwordEncoder;
        this.rawgSyncService = rawgSyncService;
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

        seedMasterTables();

        // Crear juegos de ejemplo si no existen
        if (gameRepository.count() == 0) {
            Game[] games = {
                    createGame("Hollow Knight", "Una aventura épica en un reino de insectos en ruinas. Explora cavernas tortuosas, combate contra criaturas corrompidas y haz nuevas amistades con extraños insectos.",
                            "https://www.youtube.com/embed/UAO2urG23S4", "https://cdn.akamai.steamstatic.com/steam/apps/367520/header.jpg",
                            "Team Cherry", List.of("Metroidvania", "Acción"), List.of("PC", "Nintendo Switch", "PlayStation 4", "Xbox One"), LocalDate.of(2017, 2, 24)),

                    createGame("Celeste", "Ayuda a Madeline a sobrevivir a sus demonios internos en su viaje hasta la cima de la montaña Celeste, en este juego de plataformas súper ajustado hecho a mano.",
                            "https://www.youtube.com/embed/70d9irlxiB4", "https://cdn.akamai.steamstatic.com/steam/apps/504230/header.jpg",
                            "Maddy Makes Games", List.of("Plataformas", "Indie"), List.of("PC", "Nintendo Switch", "PlayStation 4", "Xbox One"), LocalDate.of(2018, 1, 25)),

                    createGame("Hades", "Desafía al dios de los muertos como el príncipe inmortal del Inframundo, en este juego de exploración de mazmorras de ritmo trepidante de los creadores de Bastion y Transistor.",
                            "https://www.youtube.com/embed/91t0ha9x0ME", "https://cdn.akamai.steamstatic.com/steam/apps/1145360/header.jpg",
                            "Supergiant Games", List.of("Roguelike", "Acción"), List.of("PC", "Nintendo Switch", "PlayStation 4", "PlayStation 5", "Xbox One", "Xbox Series X|S"), LocalDate.of(2020, 9, 17)),

                    createGame("Stardew Valley", "Acabas de heredar la vieja parcela agrícola de tu abuelo en Stardew Valley. Decides partir hacia una nueva vida con unas herramientas usadas y algo de dinero.",
                            "https://www.youtube.com/embed/ot7uXNQskhs", "https://cdn.akamai.steamstatic.com/steam/apps/413150/header.jpg",
                            "ConcernedApe", List.of("Simulación", "RPG"), List.of("PC", "Nintendo Switch", "PlayStation 4", "Xbox One", "Mobile"), LocalDate.of(2016, 2, 26)),

                    createGame("Cuphead", "Cuphead es un juego de acción clásico estilo 'dispara y corre' que se centra en combates contra jefes. Inspirado en los dibujos animados de los años 30.",
                            "https://www.youtube.com/embed/NN-9SQXoi50", "https://cdn.akamai.steamstatic.com/steam/apps/268910/header.jpg",
                            "Studio MDHR", List.of("Acción", "Plataformas"), List.of("PC", "Nintendo Switch", "PlayStation 4", "Xbox One"), LocalDate.of(2017, 9, 29))
            };

            gameRepository.saveAll(Arrays.asList(games));
        }

        try {
            rawgSyncService.syncCatalogAndCurrentMonthReleases();
        } catch (Exception ignored) {
            // Si RAWG falla, la app sigue operativa con catálogo local.
        }
    }

    private void seedMasterTables() {
        List<String> genres = List.of("Metroidvania", "Acción", "Plataformas", "Roguelike", "Simulación", "RPG", "Indie");
        for (String genreName : genres) {
            if (genreRepository.findByName(genreName).isEmpty()) {
                Genre genre = new Genre();
                genre.setName(genreName);
                genreRepository.save(genre);
            }
        }

        List<String> platforms = List.of("PC", "Nintendo Switch", "PlayStation 4", "PlayStation 5", "Xbox One", "Xbox Series X|S", "Mobile");
        for (String platformName : platforms) {
            if (platformRepository.findByName(platformName).isEmpty()) {
                Platform platform = new Platform();
                platform.setName(platformName);
                platformRepository.save(platform);
            }
        }
    }

    private Game createGame(String title, String description, String trailerUrl, String imageUrl,
                            String developer, List<String> genreNames, List<String> platformNames, LocalDate releaseDate) {
        Game game = new Game();
        game.setTitle(title);
        game.setDescription(description);
        game.setTrailerUrl(trailerUrl);
        game.setImageUrl(imageUrl);
        game.setDeveloper(developer);
        game.setGenres(resolveGenres(genreNames));
        game.setPlatforms(resolvePlatforms(platformNames));
        game.setReleaseDate(releaseDate);
        return game;
    }

    private Set<Genre> resolveGenres(List<String> genreNames) {
        Set<Genre> genres = new LinkedHashSet<>();
        for (String genreName : genreNames) {
            Genre genre = genreRepository.findByName(genreName)
                    .orElseThrow(() -> new RuntimeException("Género no encontrado: " + genreName));
            genres.add(genre);
        }
        return genres;
    }

    private Set<Platform> resolvePlatforms(List<String> platformNames) {
        Set<Platform> platforms = new LinkedHashSet<>();
        for (String platformName : platformNames) {
            Platform platform = platformRepository.findByName(platformName)
                    .orElseThrow(() -> new RuntimeException("Plataforma no encontrada: " + platformName));
            platforms.add(platform);
        }
        return platforms;
    }
}
