package com.sistemaVentas.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class CatalogoProveedorResponseDTO {
    private Long id;
    private Long proveedorId;
    private String proveedorNombre;
    private Long productoId;
    private String productoNombre;
    private String productoCodigoBarras;
    private String productoCategoriaNombre;
    private BigDecimal precioCosto;
    private Integer stockActual;
    private Integer stockMinimo;
    private LocalDate fechaVencimiento;
    private String codigoLote;
    private Boolean esActivo;
    private LocalDateTime fechaActualizacion;
}
