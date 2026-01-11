package com.sistemaVentas.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Data;

@Entity
@Table(name = "usuarios")
@Data
public class Usuario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @NotBlank(message = "El nombre completo no puede estar en blanco")
    @Size(min = 3, max = 100)
    private String nombreCompleto;

    @NotBlank(message = "El username es obligatorio")
    @Column(unique = true)
    private String username;

    @NotBlank(message = "La contraseña no puede estar vacía")
    @com.fasterxml.jackson.annotation.JsonIgnore
    private String password;

    @ManyToOne
    @JoinColumn(name = "rol_id")
    private Rol rol;

    private Boolean activo = true;
}