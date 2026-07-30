package com.sistemaVentas.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;

@Data
public class AjusteStockDTO {

    @NotNull(message = "El producto es obligatorio")
    private Long productoId;

    @NotNull(message = "El nuevo stock es obligatorio")
    @PositiveOrZero(message = "El stock debe ser positivo o cero")
    private Integer nuevoStock;

    @NotBlank(message = "El motivo del ajuste es obligatorio")
    private String motivo;

    private String usuario;
}
