package com.sistemaVentas.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AnulacionVentaDTO {

    @NotBlank(message = "El motivo de la anulación es obligatorio")
    private String motivo;

    private String usuarioAdmin;
}
