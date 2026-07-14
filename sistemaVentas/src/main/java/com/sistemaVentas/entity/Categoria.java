package com.sistemaVentas.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Entity
@Table(name = "categorias")
@Data
public class Categoria {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @NotBlank(message = "El nombre de la categoría es obligatorio")
    @Column(unique = true, nullable = false)
    private String nombre;
}
