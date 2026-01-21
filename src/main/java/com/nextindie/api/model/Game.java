package com.nextindie.api.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "Games") // Nombre de la tabla en MySQL
@Data                  // Genera Getters, Setters, Equals, HashCode y ToString (Lombok)
@NoArgsConstructor    // Constructor vacío obligatorio para JPA
@AllArgsConstructor   // Constructor con todos los campos
public class Game {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_game")
    private Integer idGame;

    @Column(nullable = false)
    private String titulo;

    @Column(columnDefinition = "TEXT") // Mapea específicamente al tipo TEXT de MySQL
    private String descripcion;

    @Column(name = "fecha_lanzamiento")
    private LocalDate fechaLanzamiento;

    @Column(name = "trailer_url")
    private String trailerUrl;

    @Column(name = "imagen_portada")
    private String imagenPortada;

    @Column(name = "empresa_desarrolladora")
    private String empresaDesarrolladora;

    @CreationTimestamp // Spring rellena esto automáticamente al crear el registro
    @Column(name = "fecha_creacion_registro", updatable = false)
    private LocalDateTime fechaCreacionRegistro;
}