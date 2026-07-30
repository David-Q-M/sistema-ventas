package com.sistemaVentas.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class DetalleCompraResponseDTO {

    private Long id;
    private Long productoId;
    private String productoNombre;
    private String productoCodigoBarras;
    private Integer cantidad;
    private BigDecimal precioCosto;
    private BigDecimal subtotal;
    private String observacion;
}
