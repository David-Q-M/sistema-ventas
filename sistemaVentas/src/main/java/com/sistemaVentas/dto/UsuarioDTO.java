package com.sistemaVentas.dto;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Pattern;

@Data
public class UsuarioDTO {
    private Integer id;
    @NotBlank(message = "El nombre completo es obligatorio")
    @Pattern(regexp = "^[a-zA-ZáéíóúÁÉÍÓÚñÑ\\s]+$", message = "El nombre solo puede contener letras y espacios")
    private String nombreCompleto;

    @NotBlank(message = "El username es obligatorio")
    @Size(min = 5, message = "El username debe tener al menos 5 caracteres")
    private String username;

    @NotBlank(message = "La contraseña es obligatoria")
    @Size(min = 5, message = "La contraseña debe tener al menos 5 caracteres")
    private String password; // Solo para recepción, no para respuesta si se usara con cuidado
    private String rolNombre; // Para recibir el nombre del rol o ID
    private Boolean activo;
}
