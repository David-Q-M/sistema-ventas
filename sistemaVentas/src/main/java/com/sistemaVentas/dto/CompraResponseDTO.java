package com.sistemaVentas.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
public class CompraResponseDTO {

    private Long id;
    private String codigo;
    private Long proveedorId;
    private String proveedorNombre;
    private String proveedorRuc;
    private LocalDate fechaPedido;
    private LocalDate fechaEntrega;
    private String metodoPedido;
    private String estadoPago;
    private BigDecimal montoTotal;
    private String estado;
    private String observacion;
    private List<DetalleCompraResponseDTO> detalles;
}
