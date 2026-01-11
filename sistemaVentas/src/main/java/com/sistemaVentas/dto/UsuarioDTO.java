package com.sistemaVentas.dto;

import lombok.Data;

@Data
public class UsuarioDTO {
    private Integer id;
    private String nombreCompleto;
    private String username;
    private String password; // Solo para recepción, no para respuesta si se usara con cuidado
    private String rolNombre; // Para recibir el nombre del rol o ID
    private Boolean activo;
}
