package com.nextindie.api; // Asegúrate de que el paquete sea este

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class NextIndieApplication { // El nombre debe coincidir con el archivo
    public static void main(String[] args) {
        SpringApplication.run(NextIndieApplication.class, args);
    }
}