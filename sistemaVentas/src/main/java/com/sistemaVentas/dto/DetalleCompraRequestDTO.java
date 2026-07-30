package com.sistemaVentas.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class DetalleCompraRequestDTO {

    @NotNull(message = "El ID del producto es obligatorio")
    private Long productoId;

    @NotNull(message = "La cantidad es obligatoria")
    @Min(value = 1, message = "La cantidad comprada debe ser de al menos 1 unidad")
    private Integer cantidad;

    @NotNull(message = "El precio de costo es obligatorio")
    @DecimalMin(value = "0.01", message = "El precio de costo debe ser mayor a 0")
    private BigDecimal precioCosto;

    @Size(max = 255, message = "La observación del ítem no puede exceder 255 caracteres")
    private String observacion;
}
