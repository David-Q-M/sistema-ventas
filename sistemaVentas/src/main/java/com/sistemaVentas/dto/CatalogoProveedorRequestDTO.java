package com.sistemaVentas.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class CatalogoProveedorRequestDTO {

    @NotNull(message = "El ID del proveedor es obligatorio")
    private Long proveedorId;

    @NotNull(message = "El ID del producto es obligatorio")
    private Long productoId;

    @NotNull(message = "El precio de costo es obligatorio")
    @DecimalMin(value = "0.01", message = "El precio de costo debe ser mayor a cero")
    private BigDecimal precioCosto;

    @NotNull(message = "El stock actual es obligatorio")
    @Min(value = 0, message = "El stock actual no puede ser negativo")
    private Integer stockActual;

    @Min(value = 0, message = "El stock mínimo no puede ser negativo")
    private Integer stockMinimo = 10;

    private LocalDate fechaVencimiento;

    private String codigoLote;

    private Boolean esActivo = true;
}
