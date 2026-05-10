package com.nextindie.api.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.Hibernate;

import java.util.Objects;

@Entity
@Getter
@Setter
@Table(name = "platforms")
public class Platform {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false, unique = true)
    private String name;

    @Override
    public final boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || Hibernate.getClass(this) != Hibernate.getClass(o)) return false;
        Platform other = (Platform) o;
        if (id != null && other.id != null) {
            return Objects.equals(id, other.id);
        }
        return Objects.equals(name, other.name);
    }

    @Override
    public final int hashCode() {
        return id != null ? Objects.hash(id) : Objects.hash(name);
    }
}
